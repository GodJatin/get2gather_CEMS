import sys
import os
from sqlalchemy.future import select
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add the current directory to sys.path
sys.path.append(os.getcwd())

from database import get_db, SessionLocal
from models import User, UserRole, Student
from routers.security_utils import verify_password, get_password_hash

def check_user():
    email = "2305103140014@paruluniversity.ac.in"
    password = "J@tin224"

    print(f"Checking user: {email}")

    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///C:/Users/HP/.gemini/test_sync_final.db").replace("sqlite+aiosqlite", "sqlite")
    engine = create_engine(DATABASE_URL, echo=True, connect_args={"check_same_thread": False})
    
    SessionLocal = sessionmaker(bind=engine)
    
    db = SessionLocal()
    try:
        result = db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        if user:
            print(f"User found: {user.email}")
        else:
            print(f"Creating user: {email}")
            hashed_password = get_password_hash(password)
            new_user = User(
                email=email,
                hashed_password=hashed_password,
                role=UserRole.STUDENT,
                is_active=1,
                organization_name="Parul University",
                contact="1234567890"
            )
            try:
                db.add(new_user)
                db.commit()
                db.refresh(new_user)
                
                new_student = Student(
                    user_id=new_user.id,
                    name="Jatin",
                    department="CSE",
                    enrollment_number="2305103140014",
                    badges=[],
                    unlocked_features=[],
                    spent_points=0
                )
                db.add(new_student)
                db.commit()
                print(f"User created: {new_user.email}")
            except Exception as e:
                print(f"Error creating user: {e}")
                import traceback
                traceback.print_exc()
                db.rollback()
    except Exception as e:
        print(f"CRITICAL ERROR: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    check_user()
