import asyncio
from database import SessionLocal
from models import User, Student, Booking, Event
from sqlalchemy.future import select
from datetime import datetime

async def create_booking_script():
    async with SessionLocal() as db:
        email = "2305103120023@paruluniversity.ac.in"
        
        # Get User
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if not user:
            print("User not found")
            return

        # Get Student
        result = await db.execute(select(Student).where(Student.user_id == user.id))
        student = result.scalar_one_or_none()
        if not student:
            print("Student not found")
            return

        # Get Event (ID 1)
        result = await db.execute(select(Event).where(Event.id == 1))
        event = result.scalar_one_or_none()
        if not event:
            print("Event 1 not found")
            return

        # Check existing
        result = await db.execute(select(Booking).where(Booking.student_id == student.id, Booking.event_id == event.id))
        existing = result.scalar_one_or_none()
        
        if existing:
            print("Booking already exists")
        else:
            print("Creating booking...")
            booking = Booking(
                event_id=event.id,
                student_id=student.id,
                booking_date=datetime.utcnow().isoformat(),
                status="Confirmed"
            )
            db.add(booking)
            await db.commit()
            print("Booking created successfully")

if __name__ == "__main__":
    asyncio.run(create_booking_script())
