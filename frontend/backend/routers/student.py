from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.future import select
from database import get_db
from models import User, Student, UserRole, Booking, FeedPost, Volunteer, PointTransaction
from routers.auth import get_current_user
from pydantic import BaseModel
from sqlalchemy import func
from datetime import datetime
from points_utils import POINTS_PER_BOOKING, POINTS_PER_POST, POINTS_PER_VOLUNTEER

router = APIRouter(tags=["Student"])

class SpendPointsRequest(BaseModel):
    amount: int
    description: str

@router.get("/student/profile")
async def get_student_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Not a student")
        
    result = db.execute(select(Student).where(Student.user_id == current_user.id))
    student = result.scalar_one_or_none()
    
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    return {
        "id": student.id,
        "name": student.name,
        "department": student.department,
        "enrollment_number": student.enrollment_number,
        "title": student.title,
        "badges": student.badges,
        "spent_points": student.spent_points,
        "user_id": student.user_id
    }

@router.post("/student/spend")
async def spend_points(data: SpendPointsRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Not a student")
        
    result = db.execute(select(Student).where(Student.user_id == current_user.id))
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    # Calculate Available Points (Centralized)
    from points_utils import calculate_student_points
    points_data = calculate_student_points(db, student.id, current_user.id)
    
    available_points = points_data["available_points"]
    
    if available_points < data.amount:
        raise HTTPException(status_code=400, detail="Insufficient points")
        
    # Deduct points
    student.spent_points += data.amount
    
    # Log transaction
    transaction = PointTransaction(
        student_id=student.id,
        amount=-data.amount,
        description=data.description,
        timestamp=datetime.now().isoformat()
    )
    db.add(transaction)
    
    db.commit()
    
    return {"message": "Points spent successfully", "remaining_points": available_points - data.amount}

@router.get("/student/history")
async def get_student_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Not a student")
    
    # Get student ID
    result = db.execute(select(Student.id).where(Student.user_id == current_user.id))
    student_id = result.scalar_one_or_none()
    if not student_id:
        raise HTTPException(status_code=404, detail="Student profile not found")

    history = []
    
    from datetime import datetime

    # 1. Bookings
    bookings = db.execute(select(Booking).where(Booking.student_id == student_id)).scalars().all()
    for b in bookings:
        # Lazy load event title if possible, else default
        event_title = b.event.title if b.event else "Event"
        event_date = b.event.date if b.event else ""
        event_time = b.event.time if b.event else ""
        
        # Check if event has passed
        event_passed = False
        if event_date and event_time:
            try:
                event_datetime = datetime.strptime(f"{event_date} {event_time}", "%Y-%m-%d %I:%M %p")
                event_passed = datetime.now() > event_datetime
            except:
                # If parsing fails, assume not passed
                pass
        
        if b.attended:
            # Attended - award points
            history.append({
                "id": f"booking-{b.id}",
                "action": f"Event Attended: {event_title}",
                "points": POINTS_PER_BOOKING,
                "date": b.checked_in_at or b.booking_date,
                "status": "attended"
            })
        elif not b.attended and event_passed:
            # Did not attend and event has passed - no points
            history.append({
                "id": f"booking-{b.id}",
                "action": f"❌ Booked but didn't attend: {event_title}",
                "points": 0,
                "date": b.booking_date,
                "status": "no-show"
            })
        # If not attended and event hasn't passed, don't show in history yet

    # 2. Volunteers
    volunteers = db.execute(select(Volunteer).where(Volunteer.user_id == current_user.id, Volunteer.status == "Approved")).scalars().all()
    for v in volunteers:
        event_title = v.event.title if v.event else "Volunteer Activity"
        event_date = v.event.date if v.event else ""
        event_time = v.event.time if v.event else ""
        
        # Check if event has passed
        event_passed = False
        if event_date and event_time:
            try:
                event_datetime = datetime.strptime(f"{event_date} {event_time}", "%Y-%m-%d %I:%M %p")
                event_passed = datetime.now() > event_datetime
            except:
                pass
        
        if v.attended:
            history.append({
                "id": f"volunteer-{v.id}",
                "action": f"Volunteer: {event_title}",
                "points": POINTS_PER_VOLUNTEER,
                "date": v.checked_in_at or v.created_at,
                "status": "attended"
            })
        elif not v.attended and event_passed:
            history.append({
                "id": f"volunteer-{v.id}",
                "action": f"❌ Volunteered but didn't attend: {event_title}",
                "points": 0,
                "date": v.created_at,
                "status": "no-show"
            })

    # 3. Posts (always awarded)
    posts = db.execute(select(FeedPost).where(FeedPost.user_id == current_user.id)).scalars().all()
    for p in posts:
        history.append({
            "id": f"post-{p.id}",
            "action": "Post Created",
            "points": POINTS_PER_POST,
            "date": p.created_at,
            "status": "completed"
        })

    # 4. Transactions (Spending)
    transactions = db.execute(select(PointTransaction).where(PointTransaction.student_id == student_id)).scalars().all()
    for t in transactions:
        history.append({
            "id": f"tx-{t.id}",
            "action": t.description,
            "points": t.amount,
            "date": t.timestamp,
            "status": "redeemed"
        })

    # Sort by date desc
    history.sort(key=lambda x: x['date'] or "", reverse=True)
    
    return history
