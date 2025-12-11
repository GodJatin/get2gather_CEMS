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
except ImportError as e:
    # Fallback app to show error if import fails
    app = FastAPI()
    @app.get("/api/{path:path}")
    def crash_report(path: str):
        return {"error": "Failed to import backend", "detail": str(e), "path": sys.path}
