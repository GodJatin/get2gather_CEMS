from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from database import get_db
from models import User, UserRole, Student, Organizer, Event, Booking
from routers.auth import get_current_user
import schemas

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

# Dependency to check if user is admin
def get_current_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have admin privileges"
        )
    return current_user

# --- Stats ---
@router.get("/stats")
def get_admin_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    total_users = db.query(User).count()
    total_students = db.query(Student).count()
    total_organizers = db.query(Organizer).count()
    total_events = db.query(Event).count()
    total_bookings = db.query(Booking).count()
    
    return {
        "total_users": total_users,
        "total_students": total_students,
        "total_organizers": total_organizers,
        "total_events": total_events,
        "total_bookings": total_bookings
    }

# --- Users ---
@router.get("/users")
def get_all_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    # Simple list for now, can add pagination later
    users = db.query(User).all()
    return [{
        "id": u.id,
        "email": u.email,
        "role": u.role,
        "is_active": u.is_active,
        "organization_name": u.organization_name,
        "contact": u.contact
    } for u in users]

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
        
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

# --- Events ---
@router.get("/events")
def get_all_events(db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    events = db.query(Event).all()
    return events

@router.delete("/events/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    db.delete(event)
    db.commit()
    return {"message": "Event deleted successfully"}
