import asyncio
from database import get_db
from models import User, Student, Booking, Event
from sqlalchemy.future import select
from datetime import datetime

async def simulate_booking():
    async for db in get_db():
        # Get Student
        result = await db.execute(select(Student).join(User).where(User.email == "test@paruluniversity.ac.in"))
        student = result.scalar_one_or_none()
        
        if not student:
            print("Student not found.")
            return

        # Get Event
        result = await db.execute(select(Event).where(Event.title == "Tech Talk 2024"))
        event = result.scalar_one_or_none()
        
        if not event:
            print("Event not found.")
            return

        # Create Booking
        booking = Booking(
            event_id=event.id,
            student_id=student.id,
            booking_date=str(datetime.now()),
            status="Confirmed"
        )
        db.add(booking)
        
        # Update Points (Backend logic usually does this dynamically, but we need to ensure consistency)
        # Our auth/me calculates points based on bookings.
        # So just adding booking is enough.
        
        await db.commit()
        print("Booking simulated. Points should be updated.")

if __name__ == "__main__":
    asyncio.run(simulate_booking())
