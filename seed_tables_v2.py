import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Target: aws-1 (Cluster 1)
# 1. Setup Path
base_path = os.path.dirname(os.path.abspath(__file__))
backend_path = os.path.join(base_path, "frontend", "backend")
sys.path.append(backend_path)

try:
    from database import DATABASE_URL
    from models import Base, User, UserRole, Organizer, Student
except ImportError as e:
    print(f"❌ Import Error: {e}")
    sys.exit(1)

from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
hashed_password = pwd_context.hash("admin")

# 2. Connect
SESSION_URL = DATABASE_URL.replace(":6543", ":5432")
print(f"🚀 Connecting to: {SESSION_URL}")
engine = create_engine(SESSION_URL)
SessionLocal = sessionmaker(bind=engine)

# 3. Create Tables
try:
    Base.metadata.create_all(bind=engine)
    print("✅ Tables Created")
except Exception as e:
    print(f"❌ Table Creation Error: {e}")
    sys.exit(1)

# 4. Seed
db = SessionLocal()
try:
    print("🌱 Seeding Data...")

    # ADMIN
    if not db.query(User).filter(User.email == "admin@get2gather.com").first():
        admin = User(
            email="admin@get2gather.com",
            hashed_password=hashed_password,
            role=UserRole.ADMIN
        )
        db.add(admin)
        print("✅ Admin User Created")
    else:
        print("⚠️ Admin User exists")

    # ORGANIZER
    org_user = db.query(User).filter(User.email == "organizer@get2gather.com").first()
    if not org_user:
        org_user = User(
            email="organizer@get2gather.com",
            hashed_password=hashed_password,
            role=UserRole.ORGANIZER
        )
        db.add(org_user)
        db.commit() # Commit to get ID
        db.refresh(org_user)
        print("✅ Organizer User Created")

        # Create Profile
        org_profile = Organizer(
            user_id=org_user.id,
            organization_name="Get2Gather Core Team",
            contact="+91 9876543210"
        )
        db.add(org_profile)
        print("✅ Organizer Profile Created")
    else:
        print("⚠️ Organizer User exists")
        # Check if profile exists, if not create
        if not db.query(Organizer).filter(Organizer.user_id == org_user.id).first():
             org_profile = Organizer(
                user_id=org_user.id,
                organization_name="Get2Gather Core Team",
                contact="+91 9876543210"
            )
             db.add(org_profile)
             print("✅ Organizer Profile Created (Fixed Missing)")
    
    # STUDENT
    student_user = db.query(User).filter(User.email == "student@get2gather.com").first()
    if not student_user:
        student_user = User(
            email="student@get2gather.com",
            hashed_password=hashed_password,
            role=UserRole.STUDENT
        )
        db.add(student_user)
        db.commit()
        db.refresh(student_user)
        print("✅ Student User Created")
        
        # Create Profile
        student_profile = Student(
            user_id=student_user.id,
            name="Test Student",
            contact="+91 1234567890",
            department="CSE",
            enrollment_number="STU001",
            title="Novice"
        )
        db.add(student_profile)
        print("✅ Student Profile Created")
    else:
        print("⚠️ Student User exists")
        if not db.query(Student).filter(Student.user_id == student_user.id).first():
             student_profile = Student(
                user_id=student_user.id,
                name="Test Student",
                contact="+91 1234567890",
                department="CSE",
                enrollment_number="STU001",
                title="Novice"
            )
             db.add(student_profile)
             print("✅ Student Profile Created (Fixed Missing)")

    db.commit()
    print("🎉 SEEDING & FIXING COMPLETE!")

except Exception as e:
    print(f"❌ Seeding Failed: {e}")
    db.rollback()
finally:
    db.close()
