import sys
import os
import traceback
import json

# Add the backend directory to the sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))

# Global variable to store startup error
startup_error = None
app_instance = None

try:
    # Try to import the real FastAPI app
    from main import app as app_instance
except Exception:
    startup_error = traceback.format_exc()

# Raw ASGI app to handle requests
async def app(scope, receive, send):
    global app_instance, startup_error

    try:
        # If the real app loaded successfully, delegate to it
        if app_instance:
            await app_instance(scope, receive, send)
            return

        # Gather debug info
        cwd = os.getcwd()
        try:
            ls_cwd = os.listdir(cwd)
        except:
            ls_cwd = "Error listing cwd"
            
        try:
            ls_api = os.listdir(os.path.dirname(__file__))
        except:
            ls_api = "Error listing api dir"

        # Return the startup error as JSON using raw ASGI
        error_content = json.dumps({
            "status": "CRITICAL_STARTUP_ERROR",
            "message": "The backend failed to start.",
            "traceback": startup_error.split("\n") if startup_error else ["Unknown error"],
            "debug_info": {
                "cwd": cwd,
                "ls_cwd": ls_cwd,
                "api_dir": os.path.dirname(__file__),
                "ls_api": ls_api,
                "sys_path": sys.path,
                "db_configured": os.getenv("DATABASE_URL") is not None
            }
        }).encode('utf-8')

        await send({
            'type': 'http.response.start',
            'status': 500,
            'headers': [
                [b'content-type', b'application/json'],
            ],
        })
        await send({
            'type': 'http.response.body',
            'body': error_content,
        })
        
    except Exception as e:
        # Ultimate fallback if even the error reporter crashes
        crash_error = traceback.format_exc()
        crash_content = json.dumps({
            "status": "CRITICAL_RUNTIME_CRASH",
            "message": "The application crashed while handling the request.",
            "error": str(e),
            "traceback": crash_error.split("\n")
        }).encode('utf-8')
        
        await send({
            'type': 'http.response.start',
            'status': 500,
            'headers': [
                [b'content-type', b'application/json'],
            ],
        })
        await send({
            'type': 'http.response.body',
            'body': crash_content,
        })
