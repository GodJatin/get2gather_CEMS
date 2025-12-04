import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from models import User, Student, UserRole
import bcrypt
from database import DATABASE_URL as SYNC_DATABASE_URL

# Convert sync URL to async URL for asyncpg
if SYNC_DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = SYNC_DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
elif SYNC_DATABASE_URL.startswith("sqlite"):
    DATABASE_URL = "sqlite+aiosqlite:///./test.db"
else:
    DATABASE_URL = SYNC_DATABASE_URL

engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

async def restore_user():
    async with AsyncSessionLocal() as db:
        print("Restoring user...")
        email = "2305103140014@paruluniversity.ac.in"
        
        # Check if exists
        # (Skip check, just try insert, if fails we know why)
        
        user = User(
            email=email,
            hashed_password=get_password_hash("J@tin224"),
            role=UserRole.STUDENT
        )
        db.add(user)
        await db.flush()
        
        student = Student(
            user_id=user.id,
            name="Jatin Shah",
            department="CSE",
            enrollment_number="2305103140014",
            title="Restored User",
            badges=[]
        )
        db.add(student)
        await db.commit()
        print("User restored!")

if __name__ == "__main__":
    asyncio.run(restore_user())
