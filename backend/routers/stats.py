from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.future import select
from sqlalchemy import func
from database import get_db
from models import User, UserRole, Booking, Student, Volunteer
from routers.auth import get_current_user
from pydantic import BaseModel

router = APIRouter(tags=["Stats"])

class StudentStats(BaseModel):
    rank: int
    total_bookings: int
    total_volunteer: int

@router.get("/stats/student", response_model=StudentStats)
async def get_student_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Get student profile
    result = db.execute(select(Student.id, Student.user_id).where(Student.user_id == current_user.id))
    student = result.first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # Count bookings
    booking_res = db.execute(select(func.count(Booking.id)).where(Booking.student_id == student.id))
    total_bookings = booking_res.scalar() or 0

    # Count volunteer
    volunteer_res = db.execute(select(func.count(Volunteer.id)).where(Volunteer.user_id == current_user.id, Volunteer.status == "Approved"))
    total_volunteer = volunteer_res.scalar() or 0

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
        total_volunteer=total_volunteer
    )
