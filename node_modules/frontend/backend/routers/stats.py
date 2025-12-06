from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.future import select
from sqlalchemy import func
from database import get_db
from models import User, UserRole, Booking, Student, Volunteer
from routers.auth import get_current_user
from pydantic import BaseModel
import traceback

router = APIRouter(tags=["Stats"])

class StudentStats(BaseModel):
    rank: int
    total_bookings: int
    total_volunteer: int
    total_posts: int

@router.get("/stats/student", response_model=StudentStats)
async def get_student_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        if current_user.role != UserRole.STUDENT:
            raise HTTPException(status_code=403, detail="Not authorized")

        # Get student profile
        result = db.execute(select(Student.id, Student.user_id).where(Student.user_id == current_user.id))
        student = result.first()
        if not student:
            raise HTTPException(status_code=404, detail="Student profile not found")

        # Count bookings - CONFIRMED ATTENDANCE ONLY
        print(f"DEBUG: Counting bookings for student_id: {student.id}")
        booking_res = db.execute(select(func.count(Booking.id)).where(Booking.student_id == student.id, Booking.attended == True))
        total_bookings = booking_res.scalar() or 0
        print(f"DEBUG: Total bookings found: {total_bookings}")

        # Count volunteer - CONFIRMED ATTENDANCE ONLY
        volunteer_res = db.execute(select(func.count(Volunteer.id)).where(Volunteer.user_id == current_user.id, Volunteer.status == "Approved", Volunteer.attended == True))
        total_volunteer = volunteer_res.scalar() or 0

        # Count posts
        from models import FeedPost
        posts_res = db.execute(select(func.count(FeedPost.id)).where(FeedPost.user_id == current_user.id))
        total_posts = posts_res.scalar() or 0

        # Calculate Rank (Simplified: Calculate score for all, sort, find index)
        # In production, use a window function or cached leaderboard.
        all_students_res = db.execute(select(Student.id, Student.user_id))
        all_students = all_students_res.all()
        
        scores = []
        for s in all_students:
            # Calculate Score (Centralized)
            from points_utils import calculate_student_points
            points_data = calculate_student_points(db, s.id, s.user_id)
            scores.append({"id": s.id, "score": points_data["available_points"]})
        
        scores.sort(key=lambda x: x["score"], reverse=True)
        
        rank = 0
        for i, entry in enumerate(scores):
            if entry["id"] == student.id:
                rank = i + 1
                break
                
        return StudentStats(
            rank=rank,
            total_bookings=total_bookings,
            total_volunteer=total_volunteer,
            total_posts=total_posts
        )
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

class OrganizerStats(BaseModel):
    total_events: int
    total_bookings: int
    total_volunteers: int

@router.get("/stats/organizer", response_model=OrganizerStats)
async def get_organizer_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.ORGANIZER:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Get organizer profile
    from models import Organizer, Event
    result = db.execute(select(Organizer.id).where(Organizer.user_id == current_user.id))
    organizer = result.first()
    if not organizer:
        raise HTTPException(status_code=404, detail="Organizer profile not found")
    organizer_id = organizer.id

    # Count Events
    events_res = db.execute(select(func.count(Event.id)).where(Event.organizer_id == organizer_id))
    total_events = events_res.scalar() or 0

    # Count Bookings (Attendees) for these events - CONFIRMED ATTENDANCE ONLY
    # Join Booking with Event to check organizer_id
    bookings_res = db.execute(
        select(func.count(Booking.id))
        .join(Event, Booking.event_id == Event.id)
        .where(Event.organizer_id == organizer_id, Booking.attended == True)
    )
    total_bookings = bookings_res.scalar() or 0

    # Count Volunteers for these events - CONFIRMED ATTENDANCE ONLY
    volunteers_res = db.execute(
        select(func.count(Volunteer.id))
        .join(Event, Volunteer.event_id == Event.id)
        .where(Event.organizer_id == organizer_id, Volunteer.attended == True)
    )
    total_volunteers = volunteers_res.scalar() or 0

    return OrganizerStats(
        total_events=total_events,
        total_bookings=total_bookings,
        total_volunteers=total_volunteers
    )
