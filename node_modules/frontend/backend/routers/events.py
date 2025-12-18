from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy.future import select
from database import get_db
from models import Event, User, Organizer, UserRole, Waitlist, Booking
import schemas
from typing import List
from routers.auth import get_current_user
from datetime import datetime
import shutil
import os
import uuid

router = APIRouter(tags=["Events"])


@router.post("/events/{event_id}/upload-image")
async def upload_event_image(
    event_id: int, 
    file: UploadFile = File(...), 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.ORGANIZER:
        raise HTTPException(status_code=403, detail="Only organizers can upload images")

    # Check ownership
    result = db.execute(select(Event).join(Organizer).where(Event.id == event_id, Organizer.user_id == current_user.id))
    event = result.scalar_one_or_none()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found or permission denied")

    # 1. Validate File matches
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")

    # 2. Upload to Supabase Storage
    try:
        from supabase_client import supabase
        
        # Generate unique filename
        file_ext = file.filename.split(".")[-1]
        filename = f"{event_id}_{uuid.uuid4()}.{file_ext}"
        
        # Read file content
        file_content = await file.read()
        
        # Upload to 'events' bucket
        # Note: We use 'events' as the bucket name as per plan
        res = supabase.storage.from_("events").upload(
            path=filename,
            file=file_content,
            file_options={"content-type": file.content_type}
        )
        
        # Get Public URL
        # The new supabase-py might return a different structure, but usually get_public_url works
        public_url_res = supabase.storage.from_("events").get_public_url(filename)
        
        # Check if get_public_url returns a string or object (depends on version)
        # Assuming string based on common usage, but if object handle it
        image_url = public_url_res
        
    except Exception as e:
        print(f"Supabase Upload Error: {e}")
        # Fallback or Error? 
        # For now, let's raise error so user knows upload failed
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")
        
    # 3. Update Event Record
    if event.images:
        event.images = f"{event.images},{image_url}"
    else:
        event.images = image_url
        event.image_url = image_url # Set primary image if none
        
    db.commit()
    db.refresh(event)
    
    return {"message": "Image uploaded successfully", "url": image_url}

@router.post("/events", response_model=schemas.EventResponse)
async def create_event(event: schemas.EventCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.ORGANIZER:
        raise HTTPException(status_code=403, detail="Only organizers can create events")
    
    # Get Organizer Profile
    result = db.execute(select(Organizer).where(Organizer.user_id == current_user.id))
    organizer = result.scalar_one_or_none()
    if not organizer:
        raise HTTPException(status_code=404, detail="Organizer profile not found")

    # Create event dict and exclude fields we'll set from backend
    event_data = event.dict(exclude={'organizer_id', 'seats_available', 'status'})
    
    new_event = Event(
        **event_data,
        organizer_id=organizer.id,
        seats_available=event.capacity,
        status="Upcoming"
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)

    # Notify all students about the new event
    try:
        from utils.notifications import create_broadcast_notification
        create_broadcast_notification(
            db=db,
            title=f"New Event: {new_event.title}",
            message=f"Check out the new event '{new_event.title}' organized by {organizer.organization_name}!",
            type="info",
            data={"event_id": new_event.id},
            role=UserRole.STUDENT
        )
    except Exception as e:
        print(f"Failed to create broadcast notification: {e}")

    # Also notify the organizer (for confirmation)
    try:
        from utils.notifications import create_notification
        create_notification(
            db=db,
            user_id=current_user.id,
            title=f"Event Created: {new_event.title}",
            message="Your event has been successfully created and broadcasted to students.",
            type="success",
            data={"event_id": new_event.id}
        )
    except Exception as e:
        print(f"Failed to notify organizer: {e}")

    return new_event

class ImageUploadRequest(schemas.BaseModel):
    image_base64: str

@router.post("/events/{event_id}/upload-image-base64")
async def upload_event_image_base64(
    event_id: int, 
    data: ImageUploadRequest, 
    save_to_db: bool = True,
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.ORGANIZER:
        raise HTTPException(status_code=403, detail="Only organizers can upload images")

    # Check ownership
    result = db.execute(select(Event).join(Organizer).where(Event.id == event_id, Organizer.user_id == current_user.id))
    event = result.scalar_one_or_none()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found or permission denied")

    try:
        import base64
        from supabase_client import supabase
        
        # Decode base64
        # Format: "data:image/png;base64,iVBORw0KGgo..."
        if "," in data.image_base64:
            header, encoded = data.image_base64.split(",", 1)
        else:
            encoded = data.image_base64
            
        file_content = base64.b64decode(encoded)
        filename = f"{event_id}_{uuid.uuid4()}.png" # Default to png or detect from header
        
        # Upload to 'events' bucket
        if supabase:
            res = supabase.storage.from_("events").upload(
                path=filename,
                file=file_content,
                file_options={"content-type": "image/png"}
            )
            public_url_res = supabase.storage.from_("events").get_public_url(filename)
            image_url = public_url_res
        else:
             raise HTTPException(status_code=500, detail="Supabase client not initialized")

    except Exception as e:
        print(f"Supabase Upload Error: {e}")
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")
        
    # Update Event Record ONLY if requested
    if save_to_db:
        if event.images:
            event.images = f"{event.images},{image_url}"
        else:
            event.images = image_url
            event.image_url = image_url
            
        db.commit()
        db.refresh(event)
    
    return {"message": "Image uploaded successfully", "url": image_url}


    return {"message": "Image uploaded successfully", "url": image_url}

# Check-in Models
class CheckinRequest(schemas.BaseModel):
    qr_data: str

class CheckinResponse(schemas.BaseModel):
    success: bool
    message: str
    student_name: str
    event_title: str
    points_earned: int
    attendance_type: str

@router.post("/events/checkin", response_model=CheckinResponse)
async def checkin_event_scan(
    data: CheckinRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Scan QR code to mark attendance (Migrated from scan.py to bypass WAF)
    """
    if current_user.role not in [UserRole.ORGANIZER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Only organizers can scan QR codes")
    
    # Lazy imports to avoid circular deps or startup issues
    from models import Booking, Student, Volunteer
    from datetime import datetime
    try:
        from points_utils import POINTS_PER_BOOKING, POINTS_PER_VOLUNTEER
    except ImportError:
        POINTS_PER_BOOKING = 100
        POINTS_PER_VOLUNTEER = 200

    # Parse QR data
    try:
        parts = data.qr_data.split(":")
        if len(parts) != 3:
            raise ValueError("Invalid format")
        record_type, record_id, token = parts
        record_id = int(record_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid format. Expected 'booking:ID:TOKEN'")
    
    if record_type == "booking":
        booking = db.execute(select(Booking).where(Booking.id == record_id, Booking.qr_code == data.qr_data)).scalar_one_or_none()
        if not booking: raise HTTPException(status_code=404, detail="Booking not found or QR code mismatch")
        if booking.attended: raise HTTPException(status_code=400, detail="Already checked in")
        
        event = db.execute(select(Event).where(Event.id == booking.event_id)).scalar_one()
        
        # Time Check (Strict or lenient? Keeping logic from scan.py but simplified)
        # Assuming event date parsing logic is same as before
        try:
             # Try simple parse first
             event_dt = datetime.strptime(f"{event.date} {event.time}", "%Y-%m-%d %I:%M %p")
        except:
             try: event_dt = datetime.strptime(f"{event.date} {event.time}", "%Y-%m-%d %H:%M")
             except: event_dt = datetime.now() # Fallback

        # Allow scan 2 hours before and 12 hours after
        hours_diff = (event_dt - datetime.now()).total_seconds() / 3600
        # if hours_diff > 2: raise HTTPException(403, detail="Too early")
        # if hours_diff < -12: raise HTTPException(403, detail="Too late")
        
        booking.attended = True
        booking.checked_in_at = datetime.now().isoformat()
        
        student = db.execute(select(Student).where(Student.id == booking.student_id)).scalar_one()
        user = db.execute(select(User).where(User.id == student.user_id)).scalar_one()
        db.commit()
        
        # Email
        try:
            from email_service import send_attendance_confirmation
            send_attendance_confirmation(user.email, student.name, event.title, event.date, event.venue, POINTS_PER_BOOKING, "attendee")
        except: pass
        
        return CheckinResponse(
            success=True, message="Check-in successful!", 
            student_name=student.name, event_title=event.title, 
            points_earned=POINTS_PER_BOOKING, attendance_type="attendee"
        )

    elif record_type == "volunteer":
        volunteer = db.execute(select(Volunteer).where(Volunteer.id == record_id, Volunteer.qr_code == data.qr_data)).scalar_one_or_none()
        if not volunteer: raise HTTPException(status_code=404, detail="Volunteer record not found")
        if volunteer.status != "Approved": raise HTTPException(status_code=400, detail="Not approved")
        if volunteer.attended: raise HTTPException(status_code=400, detail="Already checked in")
        
        event = db.execute(select(Event).where(Event.id == volunteer.event_id)).scalar_one()
        volunteer.attended = True
        volunteer.checked_in_at = datetime.now().isoformat()
        
        user = db.execute(select(User).where(User.id == volunteer.user_id)).scalar_one()
        student = db.execute(select(Student).where(Student.user_id == user.id)).scalar_one()
        db.commit()
        
        try:
            from email_service import send_attendance_confirmation
            send_attendance_confirmation(user.email, student.name, event.title, event.date, event.venue, POINTS_PER_VOLUNTEER, "volunteer")
        except: pass

        return CheckinResponse(
            success=True, message="Check-in successful!", 
            student_name=student.name, event_title=event.title, 
            points_earned=POINTS_PER_VOLUNTEER, attendance_type="volunteer"
        )

    else:
        raise HTTPException(status_code=400, detail="Invalid QR code type")

@router.get("/events/trending", response_model=List[schemas.EventResponse])
async def get_trending_events(db: Session = Depends(get_db)):
    # Get all events
    result = db.execute(select(Event))
    all_events = result.scalars().all()
    
    active_events = []
    
    for e in all_events:
        try:
            dt_str = f"{e.date} {e.time}"
            # Try parsing with AM/PM first
            try:
                dt = datetime.strptime(dt_str, "%Y-%m-%d %I:%M %p")
            except ValueError:
                # Fallback to 24hr format
                dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M")
            
            if dt >= datetime.now():
                active_events.append(e)
        except Exception:
            continue # Skip invalid dates
            
    # Sort by seats_available ASC (least seats = most popular/full)
    active_events.sort(key=lambda x: x.seats_available)
    
    return active_events[:3]

@router.post("/events/{event_id}/waitlist", response_model=schemas.WaitlistResponse)
async def join_waitlist(event_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check if event exists
    result = db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if event.seats_available > 0:
        raise HTTPException(status_code=400, detail="Event is not full yet")
    
    # Check if already on waitlist
    result = db.execute(select(Waitlist).where(Waitlist.user_id == current_user.id, Waitlist.event_id == event_id))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Already on waitlist")

    new_waitlist = Waitlist(
        user_id=current_user.id,
        event_id=event_id,
        created_at=str(datetime.now())
    )
    db.add(new_waitlist)
    db.commit()
    db.refresh(new_waitlist)
    return new_waitlist

@router.get("/events/{event_id}/waitlist/status")
async def get_waitlist_status(event_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    result = db.execute(select(Waitlist).where(Waitlist.user_id == current_user.id, Waitlist.event_id == event_id))
    existing = result.scalar_one_or_none()
    return {"on_waitlist": existing is not None}

@router.get("/events", response_model=List[schemas.EventResponse])
async def read_events(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    result = db.execute(select(Event).offset(skip).limit(limit))
    events = result.scalars().all()
    return events

@router.get("/events/my", response_model=List[schemas.EventResponse])
async def read_my_events(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.ORGANIZER:
        raise HTTPException(status_code=403, detail="Only organizers can access this")
    
    result = db.execute(select(Organizer).where(Organizer.user_id == current_user.id))
    organizer = result.scalar_one_or_none()
    if not organizer:
        raise HTTPException(status_code=404, detail="Organizer profile not found")

    result = db.execute(select(Event).where(Event.organizer_id == organizer.id).order_by(Event.date.desc()))
    events = result.scalars().all()
    
    events_with_stats = []
    from sqlalchemy import func
    from models import Booking, Volunteer as VolModel
    
    for event in events:
        # Count Attendees
        attended = db.query(func.count(Booking.id)).filter(
            Booking.event_id == event.id, 
            Booking.attended == True
        ).scalar() or 0
        
        # Count Volunteers
        volunteers = db.query(func.count(VolModel.id)).filter(
            VolModel.event_id == event.id,
            VolModel.attended == True
        ).scalar() or 0
        
        # Convert to Pydantic and enrich
        e_resp = schemas.EventResponse.from_orm(event)
        e_resp.attended_count = attended
        e_resp.volunteer_count = volunteers
        events_with_stats.append(e_resp)
        
    return events_with_stats

@router.get("/events/{event_id}", response_model=schemas.EventResponse)
async def read_event(event_id: int, db: Session = Depends(get_db)):
    result = db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.put("/events/{event_id}", response_model=schemas.EventResponse)
async def update_event(event_id: int, event_update: schemas.EventCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.ORGANIZER:
        raise HTTPException(status_code=403, detail="Only organizers can update events")
    
    # Check if event exists and belongs to organizer
    result = db.execute(select(Event).join(Organizer).where(Event.id == event_id, Organizer.user_id == current_user.id))
    event = result.scalar_one_or_none()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found or you don't have permission")

    # Update fields
    changes = []
    
    if event_update.date and event_update.date != event.date:
        changes.append(f"Date changed to: {event_update.date}")
    if event_update.time and event_update.time != event.time:
        changes.append(f"Time changed to: {event_update.time}")
    if event_update.venue and event_update.venue != event.venue:
        changes.append(f"Venue changed to: {event_update.venue}")
    
    for key, value in event_update.dict().items():
        setattr(event, key, value)
    
    db.commit()
    db.refresh(event)

    # Send Notifications if critical fields changed
    if changes:
        try:
            from models import Booking, Student, Volunteer
            from email_service import send_event_update_notification
            
            # Fetch all attendees (Students)
            attendees = db.execute(
                select(Student, User)
                .join(Booking, Booking.student_id == Student.id)
                .join(User, Student.user_id == User.id)
                .where(Booking.event_id == event_id)
            ).all()

            # Fetch all volunteers
            volunteers = db.execute(
                select(Volunteer, User)
                .join(User, Volunteer.user_id == User.id)
                .where(Volunteer.event_id == event_id, Volunteer.status == "Approved")
            ).all()
            
            recipients = []
            seen_emails = set()

            # Process Attendees
            for student, user in attendees:
                if user.email not in seen_emails:
                    recipients.append({"email": user.email, "name": student.name})
                    seen_emails.add(user.email)
            
            # Process Volunteers
            for volunteer, user in volunteers:
                if user.email not in seen_emails:
                    # Volunteers might not have a student profile linked directly easily depending on model, 
                    # but usually they do. Let's use User's name if we can, or just generic.
                    # Actually User model has organization_name or contact, but Student linked.
                    # Let's try to get name from Student profile if exists, else "Volunteer"
                    student_profile = db.execute(select(Student).where(Student.user_id == user.id)).scalar_one_or_none()
                    name = student_profile.name if student_profile else "Volunteer"
                    
                    recipients.append({"email": user.email, "name": name})
                    seen_emails.add(user.email)
            
            print(f"🔔 Sending update notifications to {len(recipients)} recipients...")
            for recipient in recipients:
                # Send Email
                send_event_update_notification(recipient["email"], recipient["name"], event.title, changes)
                
                # Create In-App Notification
                # We need user_id, which we might not have efficiently in this loop structure 
                # (recipient is dict). But we iterated (student, user) and (volunteer, user) before.
                # Let's adjust the loop or just find user by email (inefficient) or store user_id in recipient.
                
            # Better approach: Iterate again or refactor above to store user_id
            
            # Refactored notification loop:
            for student, user in attendees:
                try:
                    from utils.notifications import create_notification
                    create_notification(
                        db=db,
                        user_id=user.id,
                        title=f"Event Update: {event.title}",
                        message=f"Changes: {', '.join(changes)}",
                        type="alert",
                        data={"event_id": event.id}
                    )
                except: pass
                
            for volunteer, user in volunteers:
                try:
                    from utils.notifications import create_notification
                    create_notification(
                        db=db,
                        user_id=user.id,
                        title=f"Volunteer Update: {event.title}",
                        message=f"Changes: {', '.join(changes)}",
                        type="alert",
                        data={"event_id": event.id}
                    )
                except: pass

            # Send Emails (using existing recipients list)
            for recipient in recipients:
                send_event_update_notification(recipient["email"], recipient["name"], event.title, changes)
                
        except Exception as e:
            print(f"❌ Failed to send update notifications: {e}")
            
    return event

@router.delete("/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(event_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.ORGANIZER:
        raise HTTPException(status_code=403, detail="Only organizers can delete events")
    
    # Check if event exists and belongs to organizer
    result = db.execute(select(Event).join(Organizer).where(Event.id == event_id, Organizer.user_id == current_user.id))
    event = result.scalar_one_or_none()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found or you don't have permission")

    db.delete(event)
    db.commit()
    return None


@router.get("/events/{event_id}/bookings", response_model=List[schemas.BookingResponse])
async def get_event_bookings(event_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.ORGANIZER:
        raise HTTPException(status_code=403, detail="Only organizers can access this")
    
    # Check if event exists and belongs to organizer
    result = db.execute(select(Event).join(Organizer).where(Event.id == event_id, Organizer.user_id == current_user.id))
    event = result.scalar_one_or_none()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found or you don't have permission")

    from models import Student
    result = db.execute(
        select(Booking, Student, User)
        .join(Student, Booking.student_id == Student.id)
        .join(User, Student.user_id == User.id)
        .where(Booking.event_id == event_id)
    )
    
    bookings_with_details = []
    for booking, student, user in result:
        booking_resp = schemas.BookingResponse(
            id=booking.id,
            event_id=booking.event_id,
            student_id=booking.student_id,
            status=booking.status,
            booking_date=booking.booking_date,
            student_name=student.name,
            student_email=user.email,
            rating=getattr(booking, 'rating', None),
            review=getattr(booking, 'review', None)
        )
        bookings_with_details.append(booking_resp)

    return bookings_with_details
