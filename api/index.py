from fastapi import FastAPI
import sys
import os

# Robust path handling for Vercel
# Root is where this file is: /api/index.py
# Backend is at: /frontend/backend
current_dir = os.path.dirname(os.path.abspath(__file__))
# Go up one level to root, then into frontend, then backend
root_dir = os.path.dirname(current_dir)
backend_dir = os.path.join(root_dir, "frontend", "backend")

# Print for debugging in Vercel logs
print(f"Adding to sys.path: {backend_dir}")

if backend_dir not in sys.path:
    sys.path.append(backend_dir)

try:
    from main import app
except ImportError as e:
    # Fallback if import fails
    app = FastAPI()
    @app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"])
    async def catch_all(path_name: str):
        import traceback
        return {
            "status": "IMPORT_ERROR_ROOT",
            "error": "Failed to import backend from root api", 
            "detail": str(e), 
            "computed_path": backend_dir,
            "sys_path": sys.path,
            "trace": traceback.format_exc()
        }
