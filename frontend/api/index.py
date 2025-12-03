import sys
import os
import traceback
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

# Add the backend directory to the sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))

try:
    from main import app
except Exception as e:
    # Safe Mode: If import fails, create a dummy app to show the error
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
