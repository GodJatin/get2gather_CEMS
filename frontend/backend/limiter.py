from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Initialize the limiter
# Key function: get_remote_address (uses IP address)
limiter = Limiter(key_func=get_remote_address)
