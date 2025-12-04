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
    # Fetch all students (Columns only)
    query = select(
        Student.id,
        Student.user_id,
        Student.name,
        Student.department,
        Student.title,
        Student.badges,
        Student.spent_points
    )
    if department:
        query = query.where(Student.department == department)
        
    result = db.execute(query)
    students = result.all() # Returns list of Rows
    
    leaderboard = []
    
    for student in students:
        # Calculate Score (Centralized)
        from points_utils import calculate_student_points, calculate_gamification
        points_data = calculate_student_points(db, student.id, student.user_id)
        
        score = points_data["available_points"]
        
        # Calculate Gamification (Centralized)
        gamification_data = calculate_gamification(student, points_data)
        
        leaderboard.append({
            "student_id": student.id,
            "student_name": student.name,
            "department": student.department,
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
