import sys
import os

# Add backend directory to sys.path
backend_path = os.path.join(os.getcwd(), 'frontend', 'backend')
sys.path.append(backend_path)

from sqlalchemy.orm import Session
from database import SessionLocal, DATABASE_URL
from models import User, OrganizerInvite, UserRole
from routers.security_utils import get_password_hash

print(f"--- AUTH FIX START ---")
print(f"Using DATABASE_URL: {DATABASE_URL}")

db = SessionLocal()

try:
    # 1. Fix Admin
    admin_email = "admin@get2gather.com"
    admin_pass = "admin123"
    hashed = get_password_hash(admin_pass)
    
    existing_admin = db.query(User).filter(User.email == admin_email).first()
    if existing_admin:
        print(f"Updating existing admin: {admin_email}")
        existing_admin.hashed_password = hashed
        existing_admin.role = UserRole.ADMIN
        existing_admin.is_active = True
    else:
        print(f"Creating new admin: {admin_email}")
        new_admin = User(
            email=admin_email,
            hashed_password=hashed,
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(new_admin)
    
    # 2. Fix Invite Code
    invite_email = "224jatin2006@gmail.com"
    invite_code = "ABCD1234"
    
    existing_invite = db.query(OrganizerInvite).filter(OrganizerInvite.email == invite_email).first()
    if existing_invite:
        print(f"Updating existing invite for: {invite_email}")
        existing_invite.invite_code = invite_code
        existing_invite.is_used = False # Reset it so it can be used!
    else:
        print(f"Creating new invite for: {invite_email}")
        new_invite = OrganizerInvite(
            email=invite_email,
            invite_code=invite_code,
            is_used=False
        )
        db.add(new_invite)

    db.commit()
    print("--- SUCCESS: Auth data patched in correct DB ---")

except Exception as e:
    print(f"--- FAILURE: {e} ---")
    db.rollback()
finally:
    db.close()
