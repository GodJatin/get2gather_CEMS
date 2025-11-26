from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, events, bookings, media, feed, volunteers, leaderboard
import time

app = FastAPI(title="Get2Gather API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
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

@app.get("/")
def read_root():
    return {"message": "Welcome to Get2Gather API"}
