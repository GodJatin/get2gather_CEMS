from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, select
from database import get_db
from models import User, Student, Booking, FeedPost, Volunteer, Notification
from routers.auth import get_current_user
from routers.notifications import create_notification
from email_service import send_weekly_winner_email
from datetime import datetime, timedelta
import json

router = APIRouter(tags=["Gamification"])

def calculate_points_since(db: Session, student_id: int, user_id: int, start_date: datetime):
    """Calculate points earned since a specific date"""
    POINTS_PER_BOOKING = 100
    POINTS_PER_POST = 50
    POINTS_PER_VOLUNTEER = 200
    
    start_str = start_date.isoformat()
    
    # 1. Bookings (Attended)
    # checked_in_at is ISO string
    b_res = db.execute(select(func.count()).select_from(Booking).where(
        Booking.student_id == student_id,
        Booking.attended == True,
        Booking.checked_in_at >= start_str
    ))
    bookings_count = b_res.scalar() or 0
    
    # 2. Posts
    # created_at is ISO string
    p_res = db.execute(select(func.count()).select_from(FeedPost).where(
        FeedPost.user_id == user_id,
        FeedPost.created_at >= start_str
    ))
    posts_count = p_res.scalar() or 0
    
    # 3. Volunteers (Attended)
    v_res = db.execute(select(func.count()).select_from(Volunteer).where(
        Volunteer.user_id == user_id,
        Volunteer.status == "Approved",
        Volunteer.attended == True,
        Volunteer.checked_in_at >= start_str
    ))
    volunteer_count = v_res.scalar() or 0
    
    total = (bookings_count * POINTS_PER_BOOKING) + (posts_count * POINTS_PER_POST) + (volunteer_count * POINTS_PER_VOLUNTEER)
    return total

@router.post("/gamification/run-weekly-job")
async def run_weekly_winners(
    current_user: User = Depends(get_current_user), # Protected, ideally Admin
    db: Session = Depends(get_db)
):
    # Only Admin or Organizer can trigger manually for testing
    # In prod, this would be a CRON job with a secret key
    
    # Calculate start of week (last 7 days for simplicity, or strict Sunday)
    # Let's do last 7 days
    start_date = datetime.now() - timedelta(days=7)
    
    # Fetch all students
    result = db.execute(select(Student, User).join(User, Student.user_id == User.id))
    students_data = result.all()
    
    weekly_scores = []
    
    for student, user in students_data:
        score = calculate_points_since(db, student.id, user.id, start_date)
        weekly_scores.append({
            "student": student,
            "user": user,
            "score": score
        })
        
    # Sort by score DESC
    weekly_scores.sort(key=lambda x: x["score"], reverse=True)
    
    # Top 5
    top_winners = weekly_scores[:5]
    
    results = []
    
    for rank, winner in enumerate(top_winners):
        student = winner["student"]
        user = winner["user"]
        score = winner["score"]
        
        if score == 0: continue # Skip if no points earned
        
        actual_rank = rank + 1
        
        # 1. Assign Badge
        badge_name = f"Weekly Winner #{actual_rank}"
        icon = "🏆" if actual_rank == 1 else "🏅"
        
        # Parse current badges
        current_badges = student.badges if isinstance(student.badges, list) else []
        
        # Check if already has badge for this week (avoid duplicates if job runs twice)
        # Using simple check for now
        week_identifier = datetime.now().strftime("%Y-%W")
        has_badge = any(b.get("week") == week_identifier and b.get("rank") == actual_rank for b in current_badges if isinstance(b, dict))
        
        if not has_badge:
            new_badge = {
                "name": badge_name,
                "icon": icon,
                "rank": actual_rank,
                "week": week_identifier,
                "date": datetime.now().strftime("%Y-%m-%d")
            }
            current_badges.append(new_badge)
            student.badges = current_badges # Trigger update
            
            # 2. Update Weekly Rank (for Profile display)
            student.weekly_rank = actual_rank
            
            # 3. Equip Effect/Frame (Optional: Auto-equip for winner)
            if actual_rank == 1:
                student.active_effect = "frame-gold"
            elif actual_rank == 2:
                student.active_effect = "frame-silver"
            elif actual_rank == 3:
                student.active_effect = "frame-bronze"
            
            # 4. Notifications
            # Internal
            create_notification(
                db=db,
                user_id=user.id,
                title="🏆 Weekly Winner!",
                message=f"Congratulations! You ranked #{actual_rank} this week with {score} points.",
                type="success",
                data={"badge": new_badge}
            )
            
            # Email
            # We need to implement send_weekly_winner_email in email_service.py first
            # Or just inline it here or mock it
            # For now, let's call the generic one if we haven't implemented specific
            try:
                # Assuming imported from email_service
                 send_weekly_winner_email(user.email, student.name, actual_rank, score)
            except:
                pass
                
            results.append(f"Rank {actual_rank}: {student.name} ({score} pts)")
            
    db.commit()
    
    return {"status": "success", "winners": results}
