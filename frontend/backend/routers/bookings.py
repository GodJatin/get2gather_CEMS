from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.future import select
from database import get_db
from models import Booking, Event, Student, User, UserRole, Waitlist
from email_service import send_booking_cancellation_email, send_waitlist_promotion_email
from qr_utils import generate_qr_code
import schemas
# from schemas import BookingCreate, BookingResponse, TokenData
from typing import List
from routers.auth import get_current_user
from datetime import datetime

router = APIRouter(tags=["Bookings"])

@router.delete("/bookings/{booking_id}")
async def cancel_booking(booking_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can cancel bookings")

    # Fetch booking
    result = db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Verify ownership
    # Booking -> Student -> User
    result = db.execute(select(Student).where(Student.id == booking.student_id))
    student = result.scalar_one()

    if student.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this booking")

    event = db.execute(select(Event).where(Event.id == booking.event_id)).scalar_one()

    # Capture details for email before deletion
    event_title = event.title
    user_email = current_user.email
    student_name = student.name

    # DELETE BOOKING
    db.delete(booking)
    event.seats_available += 1
    db.commit()

    # Send Cancellation Email
    try:
        send_booking_cancellation_email(user_email, student_name, event_title)
    except Exception as e:
        print(f"Failed to send cancellation email: {e}")

    # CHECK WAITLIST & PROMOTE
    # Get first person in waitlist (oldest created_at)
    next_in_line = db.execute(
        select(Waitlist)
        .where(Waitlist.event_id == event.id)
        .order_by(Waitlist.created_at.asc())
    ).scalars().first()

    if next_in_line:
        print(f"DEBUG: Promoting User {next_in_line.user_id} from Waitlist")
        
        try:
            # Get Student profile for waitlisted user
            promoted_student = db.execute(select(Student).where(Student.user_id == next_in_line.user_id)).scalar_one()
            promoted_user = db.execute(select(User).where(User.id == next_in_line.user_id)).scalar_one()
            
            # Create Booking
            new_booking = Booking(
                event_id=event.id,
                student_id=promoted_student.id,
                booking_date=datetime.utcnow().isoformat(),
                status="Confirmed"
            )
            
            event.seats_available -= 1 # Re-occupy seat
            
            db.add(new_booking)
            db.delete(next_in_line) # Remove from waitlist
            db.commit()
            db.refresh(new_booking)
            
            # Generate QR
            qr_data, qr_image = generate_qr_code("booking", new_booking.id)
            new_booking.qr_code = qr_data
            db.commit() # Save QR
            
            # Send Promotion Email
            send_waitlist_promotion_email(
                email=promoted_user.email,
                student_name=promoted_student.name,
                event_title=event.title,
                event_date=event.date,
                event_time=event.time,
                event_venue=event.venue,
                qr_image=qr_image,
                qr_data=qr_data,
                event_id=event.id
            )
            print(f"DEBUG: Promoted User {promoted_user.email}")
            
        except Exception as e:
            print(f"Failed to promote waitlist user: {e}")
            # If promotion fails, we rollback? OR just log error and seat remains open.
            # Ideally rollback, but we already committed the deletion. 
            # We'll leave it simple: safe try-catch blocks. 
            # If promotion fails, the seat is open for anyone to book manually.
            pass

    return {"message": "Booking cancelled successfully"}

@router.post("/bookings", response_model=schemas.BookingResponse)
async def create_booking(booking: schemas.BookingCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can book events")
    
    # Get Student Profile
    result = db.execute(select(Student).where(Student.user_id == current_user.id))
    student = result.scalar_one_or_none()
    if not student:
        print(f"DEBUG: Booking failed - No student profile for user {current_user.id}")
        raise HTTPException(status_code=404, detail="Student profile not found")

    print(f"DEBUG: Creating booking for Student {student.id}, Event {booking.event_id}")

    # Check if event exists and has seats
    result = db.execute(select(Event).where(Event.id == booking.event_id))
    event = result.scalar_one_or_none()
    if not event:
        print("DEBUG: Event not found")
        raise HTTPException(status_code=404, detail="Event not found")
    
    if event.seats_available <= 0:
        print("DEBUG: Event full")
        raise HTTPException(status_code=400, detail="Event is fully booked")

    # Check if already booked
    result = db.execute(select(Booking).where(
        Booking.event_id == booking.event_id,
        Booking.student_id == student.id
    ))
    existing_booking = result.scalar_one_or_none()
    if existing_booking:
        print("DEBUG: Already booked")
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
    
    try:
        db.add(new_booking)
        db.commit()
        db.refresh(new_booking)
        print(f"DEBUG: Booking committed. ID: {new_booking.id}")
    except Exception as e:
        print(f"DEBUG: DB Commit failed: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Database commit failed")
    
    # Generate QR code after booking is created (to get ID)
    try:
        from qr_utils import generate_qr_code
        qr_data, qr_image = generate_qr_code("booking", new_booking.id)
        new_booking.qr_code = qr_data
        db.commit()
        db.refresh(new_booking)
    except Exception as e:
        print(f"DEBUG: QR Generation failed: {e}")
        # Non-critical

    # ... email code ...
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
            ticket_type="attendee",
            event_id=event.id
        )
    except Exception as e:
        print(f"Failed to send booking email: {e}")
        # Don't fail booking if email fails

    return new_booking

class FeedbackCreate(schemas.BaseModel):
    rating: int
    review:  schemas.Optional[str] = None

@router.post("/bookings/{booking_id}/feedback")
async def submit_feedback(booking_id: int, feedback: FeedbackCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    # Verify ownership (booking.student_id -> student -> user_id)
    student_res = db.execute(select(Student).where(Student.id == booking.student_id))
    student = student_res.scalar_one()
    if student.user_id != current_user.id:
         raise HTTPException(status_code=403, detail="Not your booking")
         
    booking.rating = feedback.rating
    booking.review = feedback.review
    db.commit()
    
    return {"message": "Feedback submitted"}

@router.get("/bookings/my", response_model=List[schemas.BookingResponse])
async def read_my_bookings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    print(f"DEBUG: read_my_bookings called. User Role: {current_user.role} (Type: {type(current_user.role)})")
    if current_user.role != UserRole.STUDENT:
        print(f"DEBUG: Access Denied. Required: {UserRole.STUDENT}")
        raise HTTPException(status_code=403, detail=f"Only students can access this. Your role: {current_user.role}")
    
    result = db.execute(select(Student).where(Student.user_id == current_user.id))
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    print(f"DEBUG: Fetching bookings for Student ID {student.id}")

    # Join with Event to get details
    result = db.execute(
        select(Booking, Event)
        .join(Event, Booking.event_id == Event.id)
        .where(Booking.student_id == student.id)
    )
    
    bookings_with_events = []
    rows = result.all()
    print(f"DEBUG: Found {len(rows)} raw booking records in DB")
    
    for booking, event in rows:
        print(f"DEBUG: Processing booking {booking.id} for event {event.title}")
        # Determine status based on date
        status = booking.status
        try:
            # Try ISO/Standard formats
            # Backend usually stores as YYYY-MM-DD and HH:MM
            combined_str = f"{event.date} {event.time}"
            event_datetime = datetime.max
            
            for fmt in ["%Y-%m-%d %I:%M %p", "%Y-%m-%d %H:%M", "%d-%m-%Y %I:%M %p", "%d-%m-%Y %H:%M", "%d/%m/%Y %I:%M %p", "%d/%m/%Y %H:%M"]:
                try:
                    event_datetime = datetime.strptime(combined_str, fmt)
                    break
                except ValueError:
                    continue
            
            if event_datetime == datetime.max:
                # Fallback: try just date
                for fmt in ["%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y"]:
                    try:
                        event_datetime = datetime.strptime(event.date, fmt)
                        # Set to end of day if only date is known? Or start? Let's say end of day to be safe.
                        event_datetime = event_datetime.replace(hour=23, minute=59)
                        break
                    except ValueError:
                        continue

            if datetime.now() > event_datetime:
                status = "Completed"
        except Exception as e:
            print(f"Date parse error for event {event.id}: {e}")
            # Keep original status if parsing fails
            pass

        try:
            booking_resp = schemas.BookingResponse(
                id=booking.id,
                event_id=booking.event_id,
                student_id=booking.student_id,
                status=status,
                booking_date=booking.booking_date,
                event_title=event.title,
                event_date=event.date,
                event_time=event.time,
                event_end_time=event.end_time,
                event_venue=event.venue,
                # Ensure rating/review attributes exist (handle different object types if necessary)
                rating=getattr(booking, 'rating', None),
                review=getattr(booking, 'review', None),
                attended=booking.attended,
                checked_in_at=booking.checked_in_at,
                qr_code=booking.qr_code
            )
            bookings_with_events.append(booking_resp)
        except Exception as e:
            print(f"Error mapping booking {booking.id}: {e}")
            continue
        
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
            # Try ISO/Standard formats
            for fmt in ["%Y-%m-%d %I:%M %p", "%Y-%m-%d %H:%M", "%d-%m-%Y %I:%M %p", "%d-%m-%Y %H:%M", "%d/%m/%Y %I:%M %p", "%d/%m/%Y %H:%M"]:
                try:
                    event_datetime = datetime.strptime(f"{event.date} {event.time}", fmt)
                    break
                except ValueError:
                    continue
            else:
                event_datetime = datetime.max
        except Exception:
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
            event_end_time=event.end_time,
            event_venue=event.venue,
            attended=volunteer.attended,
            checked_in_at=volunteer.checked_in_at,
            qr_code=volunteer.qr_code
        )
        bookings_with_events.append(booking_resp)
        
    return bookings_with_events
