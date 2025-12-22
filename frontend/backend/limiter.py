from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Request

def get_remote_address_safe(request: Request):
    if request.client:
        return request.client.host
    return "127.0.0.1"

limiter = Limiter(key_func=get_remote_address_safe)
