from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from database import get_db
from models import User, Student, UserRole, Notification
from routers.auth import get_current_user
from routers.notifications import create_notification
from datetime import datetime

router = APIRouter(prefix="/gamification", tags=["Gamification"])

@router.post("/weekly-winners")
async def announce_weekly_winners(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Admin Only: Announce weekly winners, award medals, and notify everyone.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")

    # 1. Calculate Top 3 Students based on weekly_rank or points
    # Assuming weekly_rank is updated elsewhere or we check bookings/points
    # For MVP, let's just take top 3 by total points or similar metric
    # But ideally we should have a 'weekly_points' column. 
    # Let's rely on 'spent_points' + 'available_points' = total earned? 
    # Or just use the 'Leaderboard' logic (bookings count).
    
    from models import Booking
    
    # Calculate top students by bookings count (since points are mock in leaderboard currently)
    # real implementation should use a PointTransaction query for 'this week'
    
    # Mocking 'This Week' logic by just taking top global for now 
    # (Enhancement: Add timestamp filter if needed)
    
    result = db.query(Student, func.count(Booking.id).label("count"))\
        .join(Booking, Student.id == Booking.student_id)\
        .group_by(Student.id)\
        .order_by(desc("count"))\
        .limit(3)\
        .all()
    
    winners_text = []
    
    medals = ["🥇 Gold", "🥈 Silver", "🥉 Bronze"]
    
    for i, (student, count) in enumerate(result):
        medal = medals[i]
        rank = i + 1
        
        # Award Medal Badge
        new_badge = {
            "name": f"Weekly Winner #{rank}",
            "icon": medal.split(" ")[0],
            "description": f"Ranked #{rank} in weekly leaderboard",
            "earned_at": datetime.now().strftime("%Y-%m-%d")
        }
        
        # Update Badges
        current_badges = list(student.badges) if student.badges else []
        current_badges.append(new_badge)
        student.badges = current_badges
        
        # Grant Avatar Frame (Unlock logic)
        # We can add to 'inventory' or 'unlocked_features'
        special_frames = ["frame-gold", "frame-silver", "frame-bronze"]
        frame = special_frames[i]
        
        inventory = list(student.inventory) if student.inventory else []
        if frame not in inventory:
            inventory.append(frame)
            student.inventory = inventory
            
        # Equip best frame automatically?
        student.active_effect = frame
        
        winners_text.append(f"{medal}: {student.name}")
        
        # Notify Winner
        create_notification(
            db, 
            student.user_id, 
            "🏆 Congratulations!", 
            f"You won the {medal} medal this week!", 
            "success"
        )
        
    db.commit()
    
    # Broadcast to ALL users
    message = "Weekly Winners Announced! " + " | ".join(winners_text)
    
    # notify all users (Background task ideally, but for now loop 500)
    all_users = db.query(User).filter(User.is_active == True).limit(500).all()
    for user in all_users:
        create_notification(
            db,
            user.id,
            "📣 Weekly Winners",
            message,
            "info"
        )
        
    return {"message": "Winners announced successfully", "winners": winners_text}

@router.post("/equip-frame")
async def equip_frame(
    frame_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.STUDENT:
         raise HTTPException(status_code=400, detail="Only students can equip frames")
         
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(404, "Profile not found")
        
    # Check ownership
    inventory = student.inventory or []
    # Allow 'default' or check inventory
    if frame_id != "none" and frame_id not in inventory:
        # Mock: For now, allow all 'basic' frames, restrict 'gold'
        if frame_id.startswith("frame-gold") or frame_id.startswith("frame-silver"):
             raise HTTPException(403, "You don't own this frame")
             
    student.active_effect = frame_id if frame_id != "none" else None
    db.commit()
    
    return {"message": "Frame updated", "active_effect": student.active_effect}
