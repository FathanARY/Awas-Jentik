from app.routers.laporan import router as laporan_router
from app.routers.predict import router as predict_router
from app.routers.dashboard import router as dashboard_router
from app.routers.auth import router as auth_router
from app.routers.pcam import router as pcam_router
from app.routers.notifications import router as notif_router
from app.routers.mobilitas import router as mobilitas_router
from app.routers.model_info import router as model_info_router

routers = [laporan_router, predict_router, dashboard_router, auth_router, pcam_router, notif_router, mobilitas_router, model_info_router]
