from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, events, bookings, media, feed, volunteers, leaderboard, stats, social, student, admin, notifications
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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles
import os

# Create static directory if it doesn't exist
try:
    os.makedirs("static/events", exist_ok=True)
    app.mount("/static", StaticFiles(directory="static"), name="static")
except OSError:
    # Fallback for read-only file systems (like Vercel)
    # We use /tmp which is writable in Lambda environments
    print("Read-only filesystem detected. Using /tmp/static")
    os.makedirs("/tmp/static/events", exist_ok=True)
    app.mount("/static", StaticFiles(directory="/tmp/static"), name="static")

# Routers
# Note: Next.js forwards to /api/..., so we need to capture that in the routes.
# Using prefix here to match incoming requests.
API_PREFIX = "/api"

app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(events.router, prefix=API_PREFIX)
app.include_router(bookings.router, prefix=API_PREFIX)
app.include_router(media.router, prefix=API_PREFIX)
app.include_router(feed.router, prefix=API_PREFIX)
app.include_router(volunteers.router, prefix=API_PREFIX)
app.include_router(leaderboard.router, prefix=API_PREFIX)
app.include_router(stats.router, prefix=API_PREFIX)
app.include_router(social.router, prefix=API_PREFIX)
app.include_router(student.router, prefix=API_PREFIX)
app.include_router(admin.router, prefix=API_PREFIX)
app.include_router(notifications.router, prefix=API_PREFIX)

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

