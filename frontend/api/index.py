from fastapi import FastAPI
import sys
import os

# Add the backend directory to sys.path so we can import main
# Assuming this file is in /api/index.py and backend is in /backend
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(os.path.dirname(current_dir), "backend")
sys.path.append(backend_dir)

try:
    from main import app
except BaseException as e:
    # Fallback app to show error if import fails
    app = FastAPI()
    
    # Add CORS to fallback app
    from fastapi.middleware.cors import CORSMiddleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"])
    async def catch_all(path_name: str):
        import traceback
        return {
            "status": "IMPORT_ERROR",
            "error": "Failed to import backend", 
            "detail": str(e), 
            "trace": traceback.format_exc(),
            "sys_path": sys.path,
            "cwd": os.getcwd(),
            "dir_contents": os.listdir(os.getcwd()) if os.path.exists(os.getcwd()) else "CWD not accessible"
        }
