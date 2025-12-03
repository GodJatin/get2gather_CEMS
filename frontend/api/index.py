import sys
import os

# Raw ASGI app - No dependencies required
async def app(scope, receive, send):
    try:
        # Check if we can import fastapi
        import fastapi
        has_fastapi = True
    except ImportError:
        has_fastapi = False

    try:
        # Check if we can import sqlalchemy
        import sqlalchemy
        has_sqlalchemy = True
    except ImportError:
        has_sqlalchemy = False

    body_content = f"Dependency Check:\nFastAPI: {has_fastapi}\nSQLAlchemy: {has_sqlalchemy}\nPython: {sys.version}"
    
    await send({
        'type': 'http.response.start',
        'status': 200,
        'headers': [
            [b'content-type', b'text/plain'],
        ],
    })
    await send({
        'type': 'http.response.body',
        'body': body_content.encode('utf-8'),
    })
