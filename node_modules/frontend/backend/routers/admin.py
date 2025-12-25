from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from sqlalchemy.orm.attributes import flag_modified
from typing import List, Optional
from database import get_db
# Add all necessary models for cascading delete
from models import (
    User, UserRole, Student, Organizer, Event, Booking, 
    FeedPost, FeedLike, FeedComment, Media, Waitlist, 
    Volunteer, Notification, user_follows
)
from routers.auth import get_current_user
import schemas
import csv
import io
import json

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
    """
    Completely remove a user and all their related data from the system.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
        
    try:
        # 1. Clean up "Social" activity first (Likes, Comments, Notifications)
        db.query(FeedLike).filter(FeedLike.user_id == user.id).delete()
        db.query(FeedComment).filter(FeedComment.user_id == user.id).delete()
        db.query(Notification).filter(Notification.user_id == user.id).delete()
        
        # 2. Clean up Followers/Following (Association Table)
        db.execute(user_follows.delete().where(
            (user_follows.c.follower_id == user.id) | 
            (user_follows.c.followed_id == user.id)
        ))

        # 3. Clean up Media
        db.query(Media).filter(Media.user_id == user.id).delete()

        # 4. Clean up FeedPosts
        # Also requires untagging this user from OTHER posts.
        all_posts = db.query(FeedPost).all()
        for post in all_posts:
            dirty = False
            if post.tagged_users:
                try:
                    # Parse JSON if string, or use directly if list
                    tags = post.tagged_users if isinstance(post.tagged_users, list) else json.loads(str(post.tagged_users))
                    # Handle potential parsing errors if format is weird, but assuming list
                    if isinstance(tags, list) and user.id in tags:
                        tags.remove(user.id)
                        post.tagged_users = list(tags) 
                        flag_modified(post, "tagged_users")
                        dirty = True
                except Exception:
                    pass # Ignore parsing errors
            
            if dirty:
                db.add(post)
        
        # Delete the user's actual posts
        db.query(FeedPost).filter(FeedPost.user_id == user.id).delete()

        # 5. Handle Roles (Student / Organizer)
        if user.role == UserRole.STUDENT:
            student = db.query(Student).filter(Student.user_id == user.id).first()
            if student:
                # Delete student specific data
                db.query(Booking).filter(Booking.student_id == student.id).delete()
                # PointTransactions? (Not imported, assuming less critical or handled by cascade if exists)
                db.delete(student)
                
        elif user.role == UserRole.ORGANIZER:
            organizer = db.query(Organizer).filter(Organizer.user_id == user.id).first()
            if organizer:
                # Delete unrelated Events owned by this organizer?
                # "Remove existence" implies yes.
                events = db.query(Event).filter(Event.organizer_id == organizer.id).all()
                for e in events:
                    # Reuse event delete logic properly or just manual delete here
                    db.query(Booking).filter(Booking.event_id == e.id).delete()
                    db.query(Waitlist).filter(Waitlist.event_id == e.id).delete()
                    db.query(Media).filter(Media.event_id == e.id).delete()
                    db.query(Volunteer).filter(Volunteer.event_id == e.id).delete()
                    # Feed posts about event
                    db.query(FeedPost).filter(FeedPost.event_id == e.id).delete()
                    db.delete(e)
                
                db.delete(organizer)

        # 6. Finally delete the User
        db.delete(user)
        db.commit()
        return {"message": "User and all related data deleted successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

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
    """
    Delete an event and its dependencies (bookings, waitlist, media, etc.)
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    try:
        # 1. Dependencies
        db.query(Booking).filter(Booking.event_id == event.id).delete()
        db.query(Waitlist).filter(Waitlist.event_id == event.id).delete()
        db.query(Media).filter(Media.event_id == event.id).delete()
        db.query(Volunteer).filter(Volunteer.event_id == event.id).delete()
        
        # 2. Feed Posts related to event
        db.query(FeedPost).filter(FeedPost.event_id == event.id).delete()
        
        # 3. Clean tags in other posts
        all_posts = db.query(FeedPost).all()
        for post in all_posts:
            dirty = False
            if post.tagged_events:
                try:
                    tags = post.tagged_events if isinstance(post.tagged_events, list) else json.loads(str(post.tagged_events))
                    if isinstance(tags, list) and event.id in tags:
                        tags.remove(event.id)
                        post.tagged_events = list(tags) 
                        flag_modified(post, "tagged_events")
                        dirty = True
                except Exception:
                    pass
            
            if dirty:
                db.add(post)

        db.delete(event)
        db.commit()
        return {"message": "Event deleted successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
