from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, events, bookings, media
import time

app = FastAPI(title="Get2Gather API")

# Add request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"\n{'='*50}")
    print(f"Incoming request: {request.method} {request.url}")
    print(f"Headers: {dict(request.headers)}")
    print(f"{'='*50}\n")
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    print(f"Request completed in {process_time:.2f}s with status {response.status_code}")
    return response

# CORS - Allow all possible localhost variations
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://0.0.0.0:3000",
        "http://192.168.56.1:3000",  # Network address from Next.js
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(events.router)
app.include_router(bookings.router)
app.include_router(media.router)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
def read_root():
    return {"message": "Welcome to Get2Gather API"}
