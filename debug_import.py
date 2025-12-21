
import sys
import os
import traceback

print("--- DEBUGGING VERCEL IMPORT ---")
try:
    # Mimic frontend/api/index.py logic
    # The file would be at frontend/api/index.py
    # API Dir simulates where index.py lives
    api_dir = os.path.join(os.getcwd(), 'frontend', 'api')
    
    # Current logic in index.py:
    # current_dir = os.path.dirname(os.path.abspath(__file__))
    # backend_dir = os.path.join(os.path.dirname(current_dir), "backend")
    
    # Simulation:
    # If we are in 'frontend/api', dirname is 'frontend'. backend is 'frontend/backend'.
    
    # Let's perform the path math relative to CWD (d:\Desktop\Pro Test)
    # Backend is locally at frontend/backend
    backend_path = os.path.join(os.getcwd(), 'frontend', 'backend')
    
    print(f"Target Backend Path: {backend_path}")
    print(f"Path exists? {os.path.exists(backend_path)}")
    
    if backend_path not in sys.path:
        sys.path.append(backend_path)
    
    print("Attempting import...")
    from main import app
    print("SUCCESS: Imported main.app")
    
    from routers import auth
    print("SUCCESS: Imported routers.auth")
    
except Exception as e:
    print("FAILURE: Could not import backend.")
    traceback.print_exc()

print("--- END DEBUG ---")
