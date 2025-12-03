from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.future import select
from sqlalchemy import func, desc
from database import get_db
from models import User, Student, Event, Booking, user_follows
from schemas import UserCreate
from typing import List, Optional
from routers.auth import get_current_user
from pydantic import BaseModel

router = APIRouter(tags=["Social"])

class ProfileResponse(BaseModel):
    id: int
    name: str
    department: str
    title: Optional[str]
    badges: List[dict]
    stats: dict
    is_following: bool
    followers_count: int
    following_count: int
    recent_activity: List[dict]

@router.post("/social/follow/{user_id}")
async def follow_user(user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")
    
    # Check if user exists
    result = db.execute(select(User).where(User.id == user_id))
    target_user = result.scalar_one_or_none()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if already following
    # Note: This is a raw SQL check for simplicity with the association table
    query = select(user_follows).where(
        (user_follows.c.follower_id == current_user.id) & 
        (user_follows.c.followed_id == user_id)
    )
    result = db.execute(query)
    existing = result.first()

    if existing:
        # Unfollow
        stmt = user_follows.delete().where(
            (user_follows.c.follower_id == current_user.id) & 
            (user_follows.c.followed_id == user_id)
        )
        db.execute(stmt)
        msg = "Unfollowed"
    else:
        # Follow
        stmt = user_follows.insert().values(follower_id=current_user.id, followed_id=user_id)
        db.execute(stmt)
        msg = "Followed"
    
    db.commit()
    return {"message": msg}

@router.get("/social/profile/{student_id}", response_model=ProfileResponse)
async def get_profile(student_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Get Student
    result = db.execute(select(Student).where(Student.id == student_id))
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Get User object for social stats
    result = db.execute(select(User).where(User.id == student.user_id))
    target_user = result.scalar_one_or_none()

    # Get Follow Stats
    followers_res = db.execute(select(func.count()).select_from(user_follows).where(user_follows.c.followed_id == target_user.id))
    followers_count = followers_res.scalar()

    following_res = db.execute(select(func.count()).select_from(user_follows).where(user_follows.c.follower_id == target_user.id))
    following_count = following_res.scalar()

    # Check if current user is following
    is_following_res = db.execute(select(user_follows).where(
        (user_follows.c.follower_id == current_user.id) & 
        (user_follows.c.followed_id == target_user.id)
    ))
    is_following = is_following_res.first() is not None

    # Get Activity Stats
    bookings_res = db.execute(select(func.count()).select_from(Booking).where(Booking.student_id == student.id))
    total_bookings = bookings_res.scalar()

    # Get Recent Activity (Last 5 bookings)
    recent_bookings_res = db.execute(
        select(Booking, Event)
        .join(Event, Booking.event_id == Event.id)
        .where(Booking.student_id == student.id)
        .order_by(desc(Booking.booking_date))
        .limit(5)
    )
    
    recent_activity = []
    for booking, event in recent_bookings_res:
        recent_activity.append({
            "type": "booking",
            "event_title": event.title,
            "date": str(booking.booking_date)
        })

    return {
        "id": student.id,
        "name": student.name,
        "department": student.department,
        "title": student.title,
        "badges": student.badges or [],
        "stats": {
            "events_attended": total_bookings,
            "volunteer_count": 0 # Placeholder, would need volunteer table query
        },
        "is_following": is_following,
        "followers_count": followers_count,
        "following_count": following_count,
        "recent_activity": recent_activity
    }
