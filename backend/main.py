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
    ],
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
