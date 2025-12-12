import sys
import os
import traceback
import json

# Global Try-Except to catch import errors (e.g. missing fastapi)
try:
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    from fastapi.middleware.cors import CORSMiddleware
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(os.path.dirname(current_dir), "backend")
    sys.path.append(backend_dir)
    print(f"DEBUG_INDEX: Added {backend_dir} to sys.path.")

    try:
        from main import app
    except BaseException as e:
        print(f"DEBUG_INDEX: Backend Import Failed: {e}")
        app = FastAPI()
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        @app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"])
        async def catch_all(path_name: str):
            return JSONResponse({
                "status": "IMPORT_ERROR_BACKEND",
                "detail": str(e),
                "trace": traceback.format_exc()
            }, status_code=500)

except BaseException as outer_e:
    # If FastAPI itself fails to load, we can't use it. 
    # But Vercel expects a WSGI/ASGI app usually?
    # We will try to define a fallback raw app or re-raise.
    # Printing to stderr usually puts it in Vercel logs.
    print(f"CRITICAL_BOOT_ERROR: {outer_e}")
    traceback.print_exc()
    
    # Minimal fallback app using Starlette/FastAPI if possible, or just fail hard but with log.
    # Since we can't return JSON without a framework, we create a dummy app object 
    # that might expose the error if Vercel inspects it.
    
    # Try one last time to make a dummy app
    try:
        from fastapi import FastAPI
        app = FastAPI()
        @app.get("/{path:path}")
        def fail(path: str):
             return {"status": "CRITICAL_BOOT_ERROR", "detail": str(outer_e)}
    except:
        # Absolute worst case
        path_info = sys.path
        raise Exception(f"BOOT_CRASH: {outer_e} | Paths: {path_info}")

