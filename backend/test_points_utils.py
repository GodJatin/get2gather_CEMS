import asyncio
from database import get_db
from models import User, Student
from sqlalchemy.future import select
from points_utils import calculate_student_points, calculate_gamification

async def test_points():
    print("Starting test...")
    from database import engine
    print("Starting test with engine.connect()...")
    
    async with engine.connect() as conn:
        print("Connection obtained.")
        email = "2305103140014@paruluniversity.ac.in"
        from sqlalchemy import text
        
        # Raw SQL for User
        print("Fetching User via raw SQL...")
        u_res = await conn.execute(text("SELECT id FROM users WHERE email = :email"), {"email": email})
        user_row = u_res.first()
        
        if not user_row:
            print("User not found")
            return

        user_id = user_row.id
        print(f"User found: {user_id}")
        
        # Raw SQL for Student
        print("Fetching Student via raw SQL...")
        s_res = await conn.execute(text("SELECT id FROM students WHERE user_id = :uid"), {"uid": user_id})
        student_row = s_res.first()
        
        if not student_row:
            print("Student not found")
            return
            
        student_id = student_row.id
        print(f"Student found: {student_id}")
        
        if not student:
            print("Student not found")
            return
            
        print(f"Student found: {student.id}")

        try:
            print("Calculating points...")
            points_data = await calculate_student_points(db, student.id, user.id)
            print("Points calculated:", points_data)
            
            print("Calculating gamification...")
            gamification = calculate_gamification(student, points_data)
            print("Gamification:", gamification)
            
        except Exception as e:
            print(f"ERROR: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    import sys
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(test_points())
