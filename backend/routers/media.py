from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.future import select
from database import get_db
from models import Media, Event, User, UserRole
import schemas
# from schemas import MediaCreate, MediaResponse
from typing import List
from routers.auth import get_current_user
from datetime import datetime

router = APIRouter(tags=["Media"])

@router.post("/media/", response_model=schemas.MediaResponse)
async def upload_media(media: schemas.MediaCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check if event exists
    result = db.execute(select(Event).where(Event.id == media.event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    new_media = Media(
        event_id=media.event_id,
        user_id=current_user.id,
        url=media.url,
        type=media.type,
        caption=media.caption,
        uploaded_at=datetime.utcnow().isoformat(),
        is_approved=False # Requires moderation
    )
    
    db.add(new_media)
    db.commit()
    db.refresh(new_media)
    return new_media

@router.get("/events/{event_id}/media", response_model=List[schemas.MediaResponse])
async def read_event_media(event_id: int, db: Session = Depends(get_db)):
    # Only return approved media
    result = db.execute(select(Media).where(
        Media.event_id == event_id,
        Media.is_approved == True
    ))
    media_list = result.scalars().all()
    return media_list

@router.post("/media/{media_id}/approve", response_model=schemas.MediaResponse)
async def approve_media(media_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.ORGANIZER:
        raise HTTPException(status_code=403, detail="Only organizers can approve media")
    
    result = db.execute(select(Media).where(Media.id == media_id))
    media_item = result.scalar_one_or_none()
    if not media_item:
        raise HTTPException(status_code=404, detail="Media not found")
        
    # Check if organizer owns the event
    result = db.execute(select(Event).where(Event.id == media_item.event_id))
    event = result.scalar_one_or_none()
    if not event or event.organizer_id != current_user.organizer_profile.id:
        raise HTTPException(status_code=403, detail="You do not own this event")

    media_item.is_approved = True
    db.commit()
    db.refresh(media_item)
    return media_item

@router.get("/media/pending", response_model=List[schemas.MediaResponse])
async def get_pending_media(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.ORGANIZER:
        raise HTTPException(status_code=403, detail="Only organizers can view pending media")
    
    # Get all events by this organizer
    result = db.execute(select(Event.id).where(Event.organizer_id == current_user.organizer_profile.id))
    event_ids = result.scalars().all()
    
    if not event_ids:
        return []

    # Get pending media for these events
    result = db.execute(select(Media).where(
        Media.event_id.in_(event_ids),
        Media.is_approved == False
    ))
    return result.scalars().all()

