from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, events, bookings, media, feed, volunteers, leaderboard, stats, scan, social, student, admin
import time

app = FastAPI(title="Get2Gather API")

@app.on_event("startup")
def on_startup():
    import models
    print(f"Uvicorn Student columns: {models.Student.__table__.columns.keys()}")
    Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
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
    return {"message": "Welcome to Get2Gather API"}
