import sys
import os

# Add current directory to path explicitly
sys.path.append(os.getcwd())

try:
    print("Attempting to import security...")
    import security
    print(f"Successfully imported security from {security.__file__}")
    print(f"dir(security): {dir(security)}")

    print("Attempting to import routers.auth...")
    from routers import auth
    print("Successfully imported routers.auth")
except Exception as e:
    print(f"Error: {e}")
