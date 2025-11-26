from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, desc
from database import get_db
from models import User, UserRole, Booking, Student, Volunteer
from typing import List
from pydantic import BaseModel
from routers.auth import get_current_user

router = APIRouter(tags=["Leaderboard"])

class LeaderboardEntry(BaseModel):
    rank: int
    student_name: str
    department: str
    score: int # Calculated based on bookings (10pts) and volunteering (50pts)

@router.get("/leaderboard", response_model=List[LeaderboardEntry])
async def get_leaderboard(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role not in [UserRole.ORGANIZER, UserRole.ADMIN, UserRole.STUDENT]:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Fetch all students
    result = await db.execute(select(Student))
    students = result.scalars().all()

    leaderboard = []
    
    for student in students:
        # Count bookings
        booking_result = await db.execute(select(func.count(Booking.id)).where(Booking.student_id == student.id))
        booking_count = booking_result.scalar() or 0
        
        # Count approved volunteering
        volunteer_result = await db.execute(select(func.count(Volunteer.id)).where(Volunteer.user_id == student.user_id, Volunteer.status == "Approved"))
        volunteer_count = volunteer_result.scalar() or 0
        
        score = (booking_count * 100) + (volunteer_count * 200)
        
        leaderboard.append({
            "student_name": student.name,
            "department": student.department,
            "score": score
        })
    
    # Sort by score desc
    leaderboard.sort(key=lambda x: x["score"], reverse=True)
    
    # Add rank
    for i, entry in enumerate(leaderboard):
        entry["rank"] = i + 1
        
    return leaderboard
