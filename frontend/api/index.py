import sys
import os
import traceback

# Add the backend directory to the sys.path
# frontend/api/index.py -> frontend/backend
sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))

try:
    # Try to import the real FastAPI app
    from main import app
except Exception as e:
    # Safe Mode: If import fails (e.g. missing library), create a dummy app to show the error
    from fastapi import FastAPI, Request
    from fastapi.responses import JSONResponse
    
    app = FastAPI()
    error_msg = traceback.format_exc()
    
    @app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"])
    async def catch_all_error(request: Request, path_name: str):
        return JSONResponse(
            status_code=500,
            content={
                "status": "CRITICAL_STARTUP_ERROR",
                "message": "The backend failed to start.",
                "error": str(e),
                "traceback": error_msg.split("\n")
            }
        )
