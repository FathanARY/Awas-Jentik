from app.routers.laporan import router as laporan_router
from app.routers.predict import router as predict_router
from app.routers.dashboard import router as dashboard_router

routers = [laporan_router, predict_router, dashboard_router]
