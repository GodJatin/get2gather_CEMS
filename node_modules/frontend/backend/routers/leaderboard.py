from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.future import select
from sqlalchemy import func, desc
from database import get_db
from models import User, UserRole, Booking, Student, Volunteer
from typing import List, Optional
from pydantic import BaseModel
from routers.auth import get_current_user

router = APIRouter(tags=["Leaderboard"])

class LeaderboardEntry(BaseModel):
    rank: int
    student_id: int
    student_name: str
    email: str
    department: str
    score: int
    title: Optional[str] = None
    badges: List[dict] = []

@router.get("/leaderboard", response_model=List[LeaderboardEntry])
async def get_leaderboard(
    department: Optional[str] = None,
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    # Fetch all students JOIN User to get email
    query = select(
        Student.id,
        Student.user_id,
        Student.name,
        Student.department,
        Student.title,
        Student.badges,
        Student.spent_points,
        User.email
    ).join(User, Student.user_id == User.id)

    if department:
        query = query.where(Student.department == department)
        
    result = db.execute(query)
    rows = result.all() # Returns list of Rows
    
    leaderboard = []
    
    for row in rows:
        # Calculate Score (Centralized)
        from points_utils import calculate_student_points, calculate_gamification
        points_data = calculate_student_points(db, row.id, row.user_id)
        
        score = points_data["available_points"]
        
        # Calculate Gamification (Centralized)
        student_obj = row # row works as object because of select columns
        gamification_data = calculate_gamification(student_obj, points_data)
        
        leaderboard.append({
            "student_id": row.id,
            "student_name": row.name,
            "email": row.email,
            "department": row.department,
            "score": score,
            "title": gamification_data["title"],
            "badges": gamification_data["badges"]
        })
    
    # Sort by score desc
    leaderboard.sort(key=lambda x: x["score"], reverse=True)
    
    # Add rank
    for i, entry in enumerate(leaderboard):
        entry["rank"] = i + 1
        
    return leaderboard
