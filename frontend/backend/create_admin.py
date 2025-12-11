from database import SessionLocal
from models import User, UserRole, Student, Organizer
from routers.security_utils import get_password_hash

db = SessionLocal()

email = "get2gather.cems@gmail.com"
password = "admin" # Simple password for testing
role = UserRole.ADMIN

# Check if user exists
user = db.query(User).filter(User.email == email).first()

if user:
    print(f"User {email} already exists. Updating password...")
    user.hashed_password = get_password_hash(password)
    user.role = role
    db.commit()
    print("Password updated to 'admin'")
else:
    print(f"Creating new user {email}...")
    user = User(
        email=email,
        hashed_password=get_password_hash(password),
        role=role
    )
    db.add(user)
    db.commit()
    print("User created with password 'admin'")

db.close()
