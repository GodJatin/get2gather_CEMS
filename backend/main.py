from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, events, bookings, media, feed, volunteers, leaderboard, stats, scan, social, student, admin
import time
import models

app = FastAPI(title="Get2Gather API")

@app.on_event("startup")
def on_startup():
    try:
        # Create tables
        Base.metadata.create_all(bind=engine)
        print("Startup successful")
    except Exception as e:
        print(f"Startup error: {e}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "https://get2gather-cems.vercel.app",
        "https://get2gather-cems-git-main-godjatins-projects.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with /backend-api prefix to match Vercel routing
app.include_router(auth.router, prefix="/backend-api")
app.include_router(events.router, prefix="/backend-api")
app.include_router(bookings.router, prefix="/backend-api")
app.include_router(media.router, prefix="/backend-api")
app.include_router(feed.router, prefix="/backend-api")
app.include_router(volunteers.router, prefix="/backend-api")
app.include_router(leaderboard.router, prefix="/backend-api")
app.include_router(stats.router, prefix="/backend-api")
app.include_router(scan.router, prefix="/backend-api")
app.include_router(social.router, prefix="/backend-api")
app.include_router(student.router, prefix="/backend-api")
app.include_router(admin.router, prefix="/backend-api")

@app.get("/")
def read_root():
    return {"message": "Welcome to Get2Gather API (Root)"}

@app.middleware("http")
async def add_debug_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Debug-Path"] = request.url.path
    response.headers["X-Debug-Method"] = request.method
    return response

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
