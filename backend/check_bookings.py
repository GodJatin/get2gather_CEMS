import asyncio
from database import SessionLocal
from models import User, Student, Booking, Event
from sqlalchemy.future import select

async def check_student_bookings():
    async with SessionLocal() as db:
        email = "2305103120023@paruluniversity.ac.in"
        
        # Get User
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if not user:
            print(f"User {email} not found.")
            return

        # Get Student
        result = await db.execute(select(Student).where(Student.user_id == user.id))
        student = result.scalar_one_or_none()
        
        if not student:
            print("Student profile not found.")
            return

        print(f"Student ID: {student.id}")

        # Get Bookings
        result = await db.execute(select(Booking).where(Booking.student_id == student.id))
        bookings = result.scalars().all()
        
        print(f"Found {len(bookings)} bookings.")
        for b in bookings:
            print(f"Booking ID: {b.id}, Event ID: {b.event_id}, Status: {b.status}")

if __name__ == "__main__":
    asyncio.run(check_student_bookings())
