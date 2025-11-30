from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.future import select
from database import get_db
from models import Booking, Event, Student, User, UserRole
import schemas
# from schemas import BookingCreate, BookingResponse, TokenData
from typing import List
from routers.auth import get_current_user
from datetime import datetime

router = APIRouter(tags=["Bookings"])

@router.post("/bookings/", response_model=schemas.BookingResponse)
async def create_booking(booking: schemas.BookingCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can book events")
    
    # Get Student Profile
    result = db.execute(select(Student).where(Student.user_id == current_user.id))
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # Check if event exists and has seats
    result = db.execute(select(Event).where(Event.id == booking.event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if event.seats_available <= 0:
        raise HTTPException(status_code=400, detail="Event is fully booked")

    # Check if already booked
    result = db.execute(select(Booking).where(
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
    db.commit()
    db.refresh(new_booking)
    
    # Generate QR code after booking is created (to get ID)
    from qr_utils import generate_qr_code
    qr_data, qr_image = generate_qr_code("booking", new_booking.id)
    new_booking.qr_code = qr_data
    db.commit()
    db.refresh(new_booking)
    
    # Send booking confirmation email with ticket
    try:
        from email_service import send_booking_ticket
        send_booking_ticket(
            email=current_user.email,
            student_name=student.name,
            event_title=event.title,
            event_date=event.date,
            event_time=event.time,
            event_venue=event.venue,
            qr_image=qr_image,
            qr_data=qr_data,
            ticket_type="attendee"
        )
    except Exception as e:
        print(f"Failed to send booking email: {e}")
        # Don't fail booking if email fails
    
    return new_booking

@router.get("/bookings/my", response_model=List[schemas.BookingResponse])
async def read_my_bookings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can access this")
    
    result = db.execute(select(Student).where(Student.user_id == current_user.id))
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # Join with Event to get details
    result = db.execute(
        select(Booking, Event)
        .join(Event, Booking.event_id == Event.id)
        .where(Booking.student_id == student.id)
    )
    
    bookings_with_events = []
    rows = result.all()
    print(f"DEBUG: Found {len(rows)} bookings for student {student.id}")
    
    for booking, event in rows:
        print(f"DEBUG: Processing booking {booking.id} for event {event.title}")
        # Determine status based on date
        status = booking.status
        try:
            event_datetime = datetime.strptime(f"{event.date} {event.time}", "%Y-%m-%d %I:%M %p")
        except:
            # Try 24hr format if 12hr fails
            try:
                event_datetime = datetime.strptime(f"{event.date} {event.time}", "%Y-%m-%d %H:%M")
            except:
                event_datetime = datetime.max # Fallback

        if datetime.now() > event_datetime:
            status = "Completed"

        booking_resp = schemas.BookingResponse(
            id=booking.id,
            event_id=booking.event_id,
            student_id=booking.student_id,
            status=status,
            booking_date=booking.booking_date,
            event_title=event.title,
            event_date=event.date,
            event_time=event.time,
            event_venue=event.venue
        )
        bookings_with_events.append(booking_resp)
        
    # bookings_with_events populated above

    # Fetch approved volunteer records
    from models import Volunteer
    v_result = db.execute(
        select(Volunteer, Event)
        .join(Event, Volunteer.event_id == Event.id)
        .where(Volunteer.user_id == current_user.id, Volunteer.status == "Approved")
    )
    
    v_rows = v_result.all()
    print(f"DEBUG: Found {len(v_rows)} volunteer records for user {current_user.id}")
    
    for volunteer, event in v_rows:
        # Determine status based on date
        status = "Confirmed" # Volunteer approved means confirmed
        try:
            event_datetime = datetime.strptime(f"{event.date} {event.time}", "%Y-%m-%d %I:%M %p")
        except:
            try:
                event_datetime = datetime.strptime(f"{event.date} {event.time}", "%Y-%m-%d %H:%M")
            except:
                event_datetime = datetime.max

        if datetime.now() > event_datetime:
            status = "Completed"

        # Map volunteer record to BookingResponse structure
        # Use negative ID or similar to distinguish if needed, but for display it's fine
        # We can use a special status or just "Volunteer" in title if we want, 
        # but the UI expects standard fields.
        
        booking_resp = schemas.BookingResponse(
            id=volunteer.id, # Using volunteer ID
            event_id=volunteer.event_id,
            student_id=student.id,
            status=status, 
            booking_date=volunteer.created_at,
            event_title=f"{event.title} (Volunteer)",
            event_date=event.date,
            event_time=event.time,
            event_venue=event.venue
        )
        bookings_with_events.append(booking_resp)
        
    return bookings_with_events
