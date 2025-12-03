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

    # If the real app loaded successfully, delegate to it
    if app_instance:
        await app_instance(scope, receive, send)
        return

    # Otherwise, return the startup error as JSON using raw ASGI (No dependencies needed)
    error_content = json.dumps({
        "status": "CRITICAL_STARTUP_ERROR",
        "message": "The backend failed to start. Likely missing dependencies.",
        "traceback": startup_error.split("\n") if startup_error else ["Unknown error"]
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
