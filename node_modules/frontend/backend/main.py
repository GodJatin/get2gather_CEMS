from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, events, bookings, media, feed, volunteers, leaderboard, stats, scan, social, student, admin
import time
import models

app = FastAPI(title="Get2Gather API", root_path="/api")

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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers (No prefix needed because of root_path="/api")
app.include_router(auth.router)
app.include_router(events.router)
app.include_router(bookings.router)
app.include_router(media.router)
app.include_router(feed.router)
app.include_router(volunteers.router)
app.include_router(leaderboard.router)
app.include_router(stats.router)
app.include_router(scan.router)
app.include_router(social.router)
app.include_router(student.router)
app.include_router(admin.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Get2Gather API (Root)"}

@app.get("/debug-status")
def read_api_root():
    import os
    db_url = os.getenv("DATABASE_URL", "Not Set")
    return {
        "message": "Welcome to Get2Gather API",
        "status": "Running",
        "db_configured": db_url != "Not Set"
    }

# Catch-all for debugging 404/405
@app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"])
async def catch_all(request: Request, path_name: str):
    return {
        "status": "DEBUG_CATCH_ALL",
        "message": "Route not found in routers",
        "received_path": path_name,
        "method": request.method,
        "root_path": request.scope.get("root_path"),
        "path": request.scope.get("path")
    }

