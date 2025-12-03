from fastapi import FastAPI, Request

app = FastAPI()

@app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"])
async def catch_all(request: Request, path_name: str):
    return {
        "status": "STANDALONE_DEBUG",
        "message": "If you see this, Vercel routing is WORKING!",
        "received_path": path_name,
        "method": request.method,
        "headers": dict(request.headers)
    }
