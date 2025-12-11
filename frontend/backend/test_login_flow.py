import sys
import os

# Ensure backend dir is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from database import SessionLocal
    from routers.auth import verify_password, create_access_token
    from models import User
    print("Imports successful")
except ImportError as e:
    print(f"Import failed: {e}")
    sys.exit(1)

def test_login():
    db = SessionLocal()
    email = "get2gather.cems@gmail.com"
    password = "admin"
    
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"User {email} not found")
            return

        print(f"User found: {user.id}")
        
        if verify_password(password, user.hashed_password):
            print("Password verification successful")
            token = create_access_token({"sub": user.email, "role": user.role.value})
            print(f"Token generated: {token[:20]}...")
        else:
            print("Password verification failed")
            
    except Exception as e:
        print(f"Login logic failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_login()
