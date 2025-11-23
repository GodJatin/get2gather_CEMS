import asyncio
import os
import sys
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
# from main import app # Not needed for integration test against running server
from routers.security_utils import get_password_hash, verify_password

# Add the current directory to sys.path to make imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

async def run_tests():
    with open("test_result.txt", "w", encoding="utf-8") as f:
        def log(msg):
            print(msg)
            f.write(msg + "\n")

        log("\n--- Testing Hashing ---")
        password = "testpassword123"
        hashed = get_password_hash(password)
        log(f"Password: {password}")
        log(f"Hashed: {hashed}")
        
        is_valid = verify_password(password, hashed)
        log(f"Verification result: {is_valid}")
        
        if not is_valid:
            log("❌ Hashing verification failed!")
            return
        
        if not hashed.startswith("$2b$") and not hashed.startswith("$2a$"):
            log("⚠️ Warning: Hash does not look like a standard bcrypt hash (usually starts with $2b$ or $2a$).")
            log(f"Actual prefix: {hashed[:4]}")
        else:
            log("✅ Hash format looks correct (bcrypt).")

        log("\n--- Testing API Flow ---")
        # transport = ASGITransport(app=app)
        async with AsyncClient(base_url="http://localhost:8000") as ac:
            # 0. Check Email Existence (New Endpoint)
            email = "2003031240999@paruluniversity.ac.in"
            log(f"Checking if email exists: {email}")
            check_res = await ac.post("/auth/check-email", json={"email": email})
            if check_res.status_code == 200:
                exists = check_res.json().get("exists")
                log(f"Email exists: {exists}")
            else:
                log(f"❌ Email check failed: {check_res.status_code}")

            # 1. Register Student
            email = "2003031240999@paruluniversity.ac.in"
            password = "securepassword"
            
            log(f"Registering user: {email}")
            response = await ac.post("/auth/signup/student", json={
                "name": "Auth Test Student",
                "email": email,
                "password": password,
                "department": "CSE",
                "enrollment_number": "2003031240999",
                "contact": "123456789012" # 12 digits
            })
            
            if response.status_code == 400 and "Email already registered" in response.text:
                log("User already exists, proceeding to login...")
            elif response.status_code != 200:
                log(f"❌ Registration failed: {response.status_code} - {response.text}")
                return
            else:
                log("✅ Registration successful")

            # 2. Login
            log("Attempting login...")
            login_response = await ac.post("/auth/login", data={
                "username": email,
                "password": password
            })
            
            if login_response.status_code != 200:
                log(f"❌ Login failed: {login_response.status_code} - {login_response.text}")
                return
            
            token = login_response.json().get("access_token")
            if token:
                log("✅ Login successful, token received.")
                log("✅ ALL TESTS PASSED")
            else:
                log("❌ Login successful but no token received.")

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    try:
        loop.run_until_complete(run_tests())
    except Exception as e:
        with open("test_result.txt", "a", encoding="utf-8") as f:
            f.write(f"\n❌ An error occurred: {e}\n")
        print(f"\n❌ An error occurred: {e}")
