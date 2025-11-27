import asyncio
from database import get_db
from models import User, Student
from sqlalchemy.future import select
from routers.security_utils import verify_password

async def check_user():
    async for db in get_db():
        email = "2305103140014@paruluniversity.ac.in"
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if user:
            print(f"User found: {user.email}, Role: {user.role}")
            print(f"Password valid: {verify_password('J@tin224', user.hashed_password)}")
            
            # Check student profile
            s_res = await db.execute(select(Student).where(Student.user_id == user.id))
            student = s_res.scalar_one_or_none()
            if student:
                print(f"Student Profile: {student.name}, Dept: {student.department}")
                print(f"Points: Spent={student.spent_points}")
            else:
                print("Student profile NOT found.")
        else:
            print("User NOT found.")

if __name__ == "__main__":
    asyncio.run(check_user())
