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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with /api prefix to match Vercel routing
app.include_router(auth.router, prefix="/api")
app.include_router(events.router, prefix="/api")
app.include_router(bookings.router, prefix="/api")
app.include_router(media.router, prefix="/api")
app.include_router(feed.router, prefix="/api")
app.include_router(volunteers.router, prefix="/api")
app.include_router(leaderboard.router, prefix="/api")
app.include_router(stats.router, prefix="/api")
app.include_router(scan.router, prefix="/api")
app.include_router(social.router, prefix="/api")
app.include_router(student.router, prefix="/api")
app.include_router(admin.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to Get2Gather API (Root)"}

@app.get("/api")
def read_api_root():
    import os
    db_url = os.getenv("DATABASE_URL", "Not Set")
    # Mask the password if present
    if "://" in db_url:
        try:
            part1, part2 = db_url.split("://")
            if "@" in part2:
                creds, host = part2.split("@")
                db_url = f"{part1}://****@{host}"
        except:
            pass
            
    return {
        "message": "Welcome to Get2Gather API",
        "status": "Running",
        "db_url_configured": db_url != "Not Set",
        "db_url_preview": db_url
    }

