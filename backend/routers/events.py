from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
from models import Event, User, Organizer, UserRole
from schemas import EventCreate, EventResponse
from typing import List
from routers.auth import get_current_user

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
