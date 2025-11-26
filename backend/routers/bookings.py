from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
from models import Booking, Event, Student, User, UserRole
from schemas import BookingCreate, BookingResponse, TokenData
from typing import List
from routers.auth import get_current_user
from datetime import datetime

router = APIRouter(tags=["Bookings"])

@router.post("/bookings/", response_model=BookingResponse)
async def create_booking(booking: BookingCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can book events")
    
    # Get Student Profile
    result = await db.execute(select(Student).where(Student.user_id == current_user.id))
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # Check if event exists and has seats
    result = await db.execute(select(Event).where(Event.id == booking.event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if event.seats_available <= 0:
        raise HTTPException(status_code=400, detail="Event is fully booked")

    # Check if already booked
    result = await db.execute(select(Booking).where(
        Booking.event_id == booking.event_id,
        Booking.student_id == student.id
    ))
    existing_booking = result.scalar_one_or_none()
    if existing_booking:
        raise HTTPException(status_code=400, detail="You have already booked this event")

    # Create Booking
    new_booking = Booking(
        event_id=booking.event_id,
        student_id=student.id,
        booking_date=datetime.utcnow().isoformat(),
        status="Confirmed"
    )
    
    # Decrement seats
    event.seats_available -= 1
    
    db.add(new_booking)
    db.add(event) # Update event seats
    await db.commit()
    await db.refresh(new_booking)
    
    return new_booking

@router.get("/bookings/my", response_model=List[BookingResponse])
async def read_my_bookings(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can access this")
    
    result = await db.execute(select(Student).where(Student.user_id == current_user.id))
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # Join with Event to get details
    result = await db.execute(
        select(Booking, Event)
        .join(Event, Booking.event_id == Event.id)
        .where(Booking.student_id == student.id)
    )
    
    bookings_with_events = []
    rows = result.all()
    print(f"DEBUG: Found {len(rows)} bookings for student {student.id}")
    
    for booking, event in rows:
        print(f"DEBUG: Processing booking {booking.id} for event {event.title}")
        booking_resp = BookingResponse(
            id=booking.id,
            event_id=booking.event_id,
            student_id=booking.student_id,
            status=booking.status,
            booking_date=booking.booking_date,
            event_title=event.title,
            event_date=event.date,
            event_time=event.time,
            event_venue=event.venue
        )
        bookings_with_events.append(booking_resp)
        
    return bookings_with_events
