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
    return new_event

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

    result = db.execute(select(Event).where(Event.organizer_id == organizer.id))
    events = result.scalars().all()
    return events

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
    for key, value in event_update.dict().items():
        setattr(event, key, value)
    
    db.commit()
    db.refresh(event)
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
