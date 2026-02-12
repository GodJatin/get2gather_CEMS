import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from models import Base, User, Student, Organizer, UserRole
from sqlalchemy import select
import bcrypt
from database import DATABASE_URL as SYNC_DATABASE_URL

# Convert sync URL to async URL for asyncpg
if SYNC_DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = SYNC_DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
elif SYNC_DATABASE_URL.startswith("sqlite"):
    DATABASE_URL = "sqlite+aiosqlite:///./test.db"
else:
    DATABASE_URL = SYNC_DATABASE_URL

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def create_demo_users():
    async with AsyncSessionLocal() as db:
        print("Checking for demo users...")
        
        # 1. Student
        student_email = "demo_student@example.com"
        result = await db.execute(select(User).where(User.email == student_email))
        existing_student = result.scalar_one_or_none()
        
        if not existing_student:
            print(f"Creating Student: {student_email}")
            user = User(
                email=student_email,
                hashed_password=get_password_hash("Password123!"),
                role=UserRole.STUDENT,
                contact="1234567890"
            )
            db.add(user)
            await db.flush()
            
            student = Student(
                user_id=user.id,
                name="Demo Student",
                department="CSE",
                enrollment_number="DEMO123456",
                title="Newbie"
            )
            db.add(student)
            await db.commit()
            print("Student created successfully.")
        else:
            print(f"Student {student_email} already exists.")

        # 2. Organizer
        org_email = "demo_organizer@example.com"
        result = await db.execute(select(User).where(User.email == org_email))
        existing_org = result.scalar_one_or_none()
        
        if not existing_org:
            print(f"Creating Organizer: {org_email}")
            user = User(
                email=org_email,
                hashed_password=get_password_hash("Password123!"),
                role=UserRole.ORGANIZER,
                contact="0987654321",
                organization_name="Demo Events Committee"
            )
            db.add(user)
            await db.flush()
            
            organizer = Organizer(
                user_id=user.id,
                organization_name="Demo Events Committee",
                contact="0987654321"
            )
            db.add(organizer)
            await db.commit()
            print("Organizer created successfully.")
        else:
            print(f"Organizer {org_email} already exists.")

if __name__ == "__main__":
    asyncio.run(create_demo_users())
