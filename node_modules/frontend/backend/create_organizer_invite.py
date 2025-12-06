import os
import sys

# Ensure we can import from current directory
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models import OrganizerInvite
from sqlalchemy import select

def add_invite():
    print("====================================")
    print("  Create Organizer Invite Code")
    print("====================================")
    
    email = input("Enter Organizer Email: ").strip()
    if not email:
        print("Error: Email cannot be empty.")
        return

    code = input("Enter Invite Code (e.g. ORG12345): ").strip()
    if not code:
        print("Error: Code cannot be empty.")
        return

    db = SessionLocal()
    try:
        # Check if exists
        result = db.execute(select(OrganizerInvite).where(OrganizerInvite.email == email))
        existing = result.scalar_one_or_none()

        if existing:
            print(f"Invite for {email} already exists with code: {existing.invite_code}")
            update = input("Update? (y/n): ").lower()
            if update == 'y':
                existing.invite_code = code
                existing.is_used = False
                db.commit()
                print("Updated successfully!")
        else:
            new_invite = OrganizerInvite(email=email, invite_code=code, is_used=False)
            db.add(new_invite)
            db.commit()
            print("Invite created successfully!")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    add_invite()
