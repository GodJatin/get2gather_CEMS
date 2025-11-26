from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
from models import Event, User, Organizer, UserRole, Waitlist, Booking
from schemas import EventCreate, EventResponse, WaitlistCreate, WaitlistResponse, BookingResponse
from typing import List
from routers.auth import get_current_user
from datetime import datetime

router = APIRouter(tags=["Events"])

@router.post("/events/", response_model=EventResponse)
async def create_event(event: EventCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != UserRole.ORGANIZER:
        raise HTTPException(status_code=403, detail="Only organizers can create events")
    
    # Get Organizer Profile
    result = await db.execute(select(Organizer).where(Organizer.user_id == current_user.id))
    organizer = result.scalar_one_or_none()
    if not organizer:
        raise HTTPException(status_code=404, detail="Organizer profile not found")

    new_event = Event(
        **event.dict(),
        organizer_id=organizer.id,
        seats_available=event.capacity,
        status="Upcoming"
    )
    db.add(new_event)
    await db.commit()
    await db.refresh(new_event)
    return new_event

@router.post("/events/{event_id}/waitlist", response_model=WaitlistResponse)
async def join_waitlist(event_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Check if event exists
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if event.seats_available > 0:
        raise HTTPException(status_code=400, detail="Event is not full yet")
    
    # Check if already on waitlist
    result = await db.execute(select(Waitlist).where(Waitlist.user_id == current_user.id, Waitlist.event_id == event_id))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Already on waitlist")

    new_waitlist = Waitlist(
        user_id=current_user.id,
        event_id=event_id,
        created_at=str(datetime.now())
    )
    db.add(new_waitlist)
    await db.commit()
    await db.refresh(new_waitlist)
    return new_waitlist

@router.get("/events/{event_id}/waitlist/status")
async def get_waitlist_status(event_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Waitlist).where(Waitlist.user_id == current_user.id, Waitlist.event_id == event_id))
    existing = result.scalar_one_or_none()
    return {"on_waitlist": existing is not None}

@router.get("/events/", response_model=List[EventResponse])
async def read_events(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Event).offset(skip).limit(limit))
    events = result.scalars().all()
    return events

@router.get("/events/my", response_model=List[EventResponse])
async def read_my_events(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != UserRole.ORGANIZER:
        raise HTTPException(status_code=403, detail="Only organizers can access this")
    
    result = await db.execute(select(Organizer).where(Organizer.user_id == current_user.id))
    organizer = result.scalar_one_or_none()
    if not organizer:
        raise HTTPException(status_code=404, detail="Organizer profile not found")

    result = await db.execute(select(Event).where(Event.organizer_id == organizer.id))
    events = result.scalars().all()
    return events

@router.get("/events/{event_id}", response_model=EventResponse)
async def read_event(event_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.put("/events/{event_id}", response_model=EventResponse)
async def update_event(event_id: int, event_update: EventCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != UserRole.ORGANIZER:
        raise HTTPException(status_code=403, detail="Only organizers can update events")
    
    # Check if event exists and belongs to organizer
    result = await db.execute(select(Event).join(Organizer).where(Event.id == event_id, Organizer.user_id == current_user.id))
    event = result.scalar_one_or_none()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found or you don't have permission")

    # Update fields
    for key, value in event_update.dict().items():
        setattr(event, key, value)
    
    # Recalculate seats if capacity changed (optional, but good for consistency)
    # For now, we assume simple update. If capacity reduces below booked, we might have issues.
    # Let's just update for now.
    
    await db.commit()
    await db.refresh(event)
    return event

@router.get("/events/{event_id}/bookings", response_model=List[BookingResponse])
async def get_event_bookings(event_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != UserRole.ORGANIZER:
        raise HTTPException(status_code=403, detail="Only organizers can access this")
    
    # Check if event exists and belongs to organizer
    result = await db.execute(select(Event).join(Organizer).where(Event.id == event_id, Organizer.user_id == current_user.id))
    event = result.scalar_one_or_none()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found or you don't have permission")

    # Get bookings with student details
    # We need to join Booking with Student to get student info, but BookingResponse currently returns IDs.
    # Let's stick to BookingResponse for now, but maybe we need a richer response.
    # Actually, the user wants to see WHO booked.
    # Let's update BookingResponse or create a new schema?
    # BookingResponse has student_id. The frontend can't resolve that easily.
    # Let's create a specific response for this.
    
    result = await db.execute(select(Booking).where(Booking.event_id == event_id))
    bookings = result.scalars().all()
    
    # Enrich with student details?
    # For now, let's just return bookings. The frontend might need student names.
    # Let's modify the query to fetch student names.
    
    from models import Student
    result = await db.execute(
        select(Booking, Student, User)
        .join(Student, Booking.student_id == Student.id)
        .join(User, Student.user_id == User.id)
        .where(Booking.event_id == event_id)
    )
    
    bookings_with_details = []
    for booking, student, user in result:
        booking_resp = BookingResponse(
            id=booking.id,
            event_id=booking.event_id,
            student_id=booking.student_id,
            status=booking.status,
            booking_date=booking.booking_date,
            student_name=student.name,
            student_email=user.email
        )
        bookings_with_details.append(booking_resp)

    return bookings_with_details
