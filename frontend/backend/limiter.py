from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from fastapi import Request

def get_real_ip(request: Request):
    """
    Robust IP detection for Vercel/Serverless/Proxies.
    Prioritizes X-Forwarded-For, falls back to request.client.host, then localhost.
    """
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0]
    
    if request.client and request.client.host:
        return request.client.host
        
    return "127.0.0.1"

# Initialize the limiter with the robust key function
limiter = Limiter(key_func=get_real_ip)
