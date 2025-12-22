from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from database import get_db
from models import User, UserRole, Student, Organizer, Event, Booking
from routers.auth import get_current_user
import schemas
import csv
import io

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
    # Count by Role for accuracy (Profile tables might catch up later)
    total_students = db.query(User).filter(User.role == UserRole.STUDENT).count()
    total_organizers = db.query(User).filter(User.role == UserRole.ORGANIZER).count()
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
@router.get("/users/export")
def export_users_csv(db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    users = db.query(User).order_by(User.id.asc()).all()
    
    def iter_csv():
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write Header
        writer.writerow(["ID", "Email", "Role", "Organization", "Contact", "Is Active"])
        yield output.getvalue()
        output.seek(0)
        output.truncate(0)
        
        # Write Rows
        for u in users:
            writer.writerow([
                u.id, 
                u.email, 
                u.role.value if hasattr(u.role, 'value') else u.role, 
                u.organization_name or "", 
                u.contact or "", 
                "Yes" if u.is_active else "No"
            ])
            yield output.getvalue()
            output.seek(0)
            output.truncate(0)

    return StreamingResponse(
        iter_csv(), 
        media_type="text/csv", 
        headers={"Content-Disposition": "attachment; filename=all_users_export.csv"}
    )

@router.get("/users")
def get_users_paginated(
    skip: int = 0, 
    limit: int = 20, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_admin)
):
    total = db.query(User).count()
    users = db.query(User).order_by(User.id.desc()).offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "page": (skip // limit) + 1,
        "size": limit,
        "users": [{
            "id": u.id,
            "email": u.email,
            "role": u.role,
            "is_active": u.is_active,
            "organization_name": u.organization_name,
            "contact": u.contact
        } for u in users]
    }

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
    
    events_with_data = []
    for event in events:
        # Calculate avg rating
        avg = db.query(func.avg(Booking.rating)).filter(Booking.event_id == event.id, Booking.rating != None).scalar()
        
        # Convert to dict
        e_dict = {
            "id": event.id,
            "title": event.title,
            "organizer_id": event.organizer_id,
            "date": event.date,
            "time": event.time,
            "status": event.status,
            "seats_available": event.seats_available,
            "capacity": event.capacity,
            "avg_rating": round(avg, 1) if avg else 0
        }
        events_with_data.append(e_dict)
        
    return events_with_data

@router.delete("/events/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    db.delete(event)
    db.commit()
    return {"message": "Event deleted successfully"}
