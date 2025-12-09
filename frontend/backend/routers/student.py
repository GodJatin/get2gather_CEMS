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
    
    print(f"DEBUG: Get Profile called for user {current_user.email}. Student found: {student is not None}")
    
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # Calculate points for profile
    from points_utils import calculate_student_points, calculate_gamification
    points_data = calculate_student_points(db, student.id, current_user.id)
    gamification_data = calculate_gamification(student, points_data)
        
    return {
        "id": student.id,
        "name": student.name,
        "department": student.department,
        "enrollment_number": student.enrollment_number,
        "title": gamification_data["title"],
        "badges": gamification_data["badges"],
        "inventory": student.inventory or [],
        "active_effect": student.active_effect,
        "spent_points": student.spent_points,
        "user_id": student.user_id,
        "email": current_user.email,
        "events_attended": points_data["bookings_count"],
        "volunteer_count": points_data["volunteer_count"],
        "total_points": points_data["total_points"],
        "available_points": points_data["available_points"]
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

class BuyItemRequest(BaseModel):
    item_id: int
    item_type: str # 'badge' or 'effect' or 'other'
    cost: int
    name: str
    metadata: dict = {}

@router.post("/student/buy")
async def buy_item(data: BuyItemRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Not a student")
        
    result = db.execute(select(Student).where(Student.user_id == current_user.id))
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    # Calculate Points
    from points_utils import calculate_student_points
    points_data = calculate_student_points(db, student.id, current_user.id)
    available = points_data["available_points"]
    
    if available < data.cost:
        raise HTTPException(status_code=400, detail="Insufficient points")
    
    # Check if already owned
    inventory = list(student.inventory) if student.inventory else []
    # simple check by name or id + type
    for item in inventory:
        if item.get('name') == data.name and item.get('type') == data.item_type:
            raise HTTPException(status_code=400, detail="Item already owned")

    # Deduct points
    student.spent_points += data.cost
    
    # Add to Inventory
    new_item = {
        "id": data.item_id,
        "type": data.item_type,
        "name": data.name,
        "bought_at": datetime.now().isoformat(),
        **data.metadata
    }
    inventory.append(new_item)
    student.inventory = inventory # Assign back to trigger update

    # If badge, also add to badges list for compatibility
    if data.item_type == 'badge':
        badges = list(student.badges) if student.badges else []
        badges.append({"name": data.name, "icon": data.metadata.get("icon", "🏅")})
        student.badges = badges

    # Log transaction
    transaction = PointTransaction(
        student_id=student.id,
        amount=-data.cost,
        description=f"Bought: {data.name}",
        timestamp=datetime.now().isoformat()
    )
    db.add(transaction)
    
    db.commit()
    return {"message": "Item purchased", "remaining_points": available - data.cost, "inventory": student.inventory}

class EquipItemRequest(BaseModel):
    item_name: str
    item_type: str # 'effect'

@router.post("/student/equip")
async def equip_item(data: EquipItemRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Not a student")

    result = db.execute(select(Student).where(Student.user_id == current_user.id))
    student = result.scalar_one_or_none()
    
    # Verify ownership
    inventory = student.inventory or []
    owned = any(i.get('name') == data.item_name and i.get('type') == data.item_type for i in inventory)
    
    # Allow unequipping specific effects or if owned
    if not owned and data.item_name != "None":
         raise HTTPException(status_code=400, detail="Item not owned")

    if data.item_type == 'effect':
        student.active_effect = None if data.item_name == "None" else data.item_name
    
    db.commit()
    return {"message": "Item equipped", "active_effect": student.active_effect}

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
