from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, events, bookings, media, feed, volunteers, leaderboard, stats, scan, social, student, admin
import time

app = FastAPI(title="Get2Gather API", root_path="/api")

@app.on_event("startup")
def on_startup():
    try:
        import models
        # print(f"Uvicorn Student columns: {models.Student.__table__.columns.keys()}")
        # Base.metadata.create_all(bind=engine)
        print("Startup successful (DB creation skipped for safety during debug)")
    except Exception as e:
        print(f"Startup Error: {e}")

@app.middleware("http")
async def strip_api_prefix(request: Request, call_next):
    if request.url.path.startswith("/api"):
        request.scope["path"] = request.url.path[4:]
    response = await call_next(request)
    return response

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

# Include routers
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
