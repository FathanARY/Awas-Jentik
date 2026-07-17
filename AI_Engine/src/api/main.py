"""FastAPI entry point with auditable TabPFN-only risk assessments."""

from __future__ import annotations

import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.api.schemas import RiskAssessmentRequest, RiskAssessmentResponse
from src.repositories.audit import AuditRepository
from src.repositories.cases import CaseRepository
from src.repositories.grid import GridRepository
from src.repositories.rainfall import RainfallProvider, RainfallUnavailable
from src.services.model import ModelNotReady, TabPFNModelService
from src.services.risk import RiskService
from src.settings import load_config, project_path


@asynccontextmanager
async def lifespan(app: FastAPI):
    config = load_config()
    workbook = project_path(config["dataset"]["source_workbook"])
    models_dir = project_path("models")
    model_service = TabPFNModelService(
        models_dir=models_dir,
        cache_dir=project_path(config["tabpfn"]["cache_directory"]),
    )
    app.state.config = config
    app.state.model_service = model_service
    app.state.risk_service = RiskService(
        config=config,
        model_service=model_service,
        grid_repository=GridRepository(workbook),
        rainfall_provider=RainfallProvider(config),
        case_repository=CaseRepository(config),
    )
    app.state.audit_repository = AuditRepository(
        project_path(config["api"]["audit_database"])
    )
    yield


app = FastAPI(
    title="Garuda70 Habitat Risk API",
    version="1.2.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def assign_request_id(request: Request, call_next):
    request.state.request_id = request.headers.get("X-Request-ID", uuid.uuid4().hex)
    return await call_next(request)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    code = {
        404: "grid_not_found",
        422: "validation_error",
        503: "dependency_unavailable",
    }.get(exc.status_code, "unexpected_error")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "request_id": request.state.request_id,
            "code": code,
            "message": str(exc.detail),
            "details": None,
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "request_id": request.state.request_id,
            "code": "validation_error",
            "message": "Input tidak valid atau melanggar domain schema.",
            "details": exc.errors(),
        },
    )


@app.get("/health")
def health(request: Request):
    model = request.app.state.model_service
    return {
        "status": "ok",
        "model_status": "ready" if model.is_ready() else "not_ready",
        "model_version": model.metadata().get("model_version"),
    }


@app.get("/v1/model-info")
def model_info(request: Request):
    model = request.app.state.model_service
    return {
        "ready": model.is_ready(),
        "metadata": model.metadata(),
        "feature_schema": request.app.state.config["schema"],
    }


@app.get("/v1/grids/{grid_id}")
def get_grid(grid_id: str, request: Request):
    try:
        return {
            "grid_id": grid_id,
            "environmental_features": request.app.state.risk_service._grid_repository.habitat_features(
                grid_id
            ),
        }
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.post("/v1/risk-assessments", response_model=RiskAssessmentResponse)
def risk_assessment(payload: RiskAssessmentRequest, request: Request):
    request_id = f"asm_{request.state.request_id}"
    try:
        result = request.app.state.risk_service.assess(payload)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except RainfallUnavailable as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ModelNotReady as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    result["assessment_id"] = request_id
    request.app.state.audit_repository.log(
        request_id=request_id,
        grid_id=payload.grid_id,
        model_version=result["model_version"],
        payload=payload.model_dump(),
        response=result,
    )
    return result
