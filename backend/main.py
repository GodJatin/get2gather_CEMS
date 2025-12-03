from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, events, bookings, media, feed, volunteers, leaderboard, stats, scan, social, student, admin
import time

app = FastAPI(title="Get2Gather API")

@app.on_event("startup")
def on_startup():
    try:
        import models
        # print(f"Uvicorn Student columns: {models.Student.__table__.columns.keys()}")
        # Base.metadata.create_all(bind=engine)
        print("Startup successful (DB creation skipped for safety during debug)")
    except Exception as e:
        print(f"Startup Error: {e}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "https://get2gather-cems.vercel.app",
        "https://get2gather-cems-git-main-godjatins-projects.vercel.app"
# ... routers included ...

@app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
async def catch_all(request: Request, path_name: str):
    return {
        "status": "404/405 Debug",
        "message": "Route not found or method not allowed",
        "received_path": path_name,
        "method": request.method,
        "base_url": str(request.base_url),
        "routers_loaded": [r.path_format for r in app.routes]
    }
