from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.future import select
from database import get_db
from models import Volunteer, Event, User, UserRole, Student
from schemas import VolunteerCreate, VolunteerResponse, VolunteerUpdate
from typing import List
from routers.auth import get_current_user
from datetime import datetime

router = APIRouter(tags=["Volunteers"])

@router.post("/events/{event_id}/volunteer", response_model=VolunteerResponse)
async def apply_volunteer(event_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can apply")

    # Check if event exists
    result = db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Check if already applied
    result = db.execute(select(Volunteer).where(Volunteer.user_id == current_user.id, Volunteer.event_id == event_id))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Already applied")

    new_volunteer = Volunteer(
        user_id=current_user.id,
        event_id=event_id,
        status="Pending",
        created_at=str(datetime.now())
    )
    db.add(new_volunteer)
    db.commit()
    db.refresh(new_volunteer)
    return new_volunteer

@router.get("/events/{event_id}/volunteers", response_model=List[VolunteerResponse])
async def get_event_volunteers(event_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check permissions (Organizer of event or Admin)
    # For now, allow any organizer to see (simplification) or check ownership
    if current_user.role not in [UserRole.ORGANIZER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")

    result = db.execute(select(Volunteer).where(Volunteer.event_id == event_id))
    volunteers = result.scalars().all()
    
    # Enrich with student details? 
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.future import select
from database import get_db
from models import Volunteer, Event, User, UserRole, Student
from schemas import VolunteerCreate, VolunteerResponse, VolunteerUpdate
from typing import List
from routers.auth import get_current_user
from datetime import datetime

router = APIRouter(tags=["Volunteers"])

@router.post("/events/{event_id}/volunteer", response_model=VolunteerResponse)
async def apply_volunteer(event_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can apply")

    # Check if event exists
    result = db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Check if already applied
    result = db.execute(select(Volunteer).where(Volunteer.user_id == current_user.id, Volunteer.event_id == event_id))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Already applied")

    new_volunteer = Volunteer(
        user_id=current_user.id,
        event_id=event_id,
        status="Pending",
        created_at=str(datetime.now())
    )
    db.add(new_volunteer)
    db.commit()
    db.refresh(new_volunteer)
    return new_volunteer

@router.get("/events/{event_id}/volunteers", response_model=List[VolunteerResponse])
async def get_event_volunteers(event_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check permissions (Organizer of event or Admin)
    # For now, allow any organizer to see (simplification) or check ownership
    if current_user.role not in [UserRole.ORGANIZER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")

    result = db.execute(
        select(Volunteer, Student, User)
        .join(User, Volunteer.user_id == User.id)
        .join(Student, User.id == Student.user_id)
        .where(Volunteer.event_id == event_id)
    )
    
    volunteers_resp = []
    for volunteer, student, user in result:
        v_resp = VolunteerResponse(
            id=volunteer.id,
            user_id=volunteer.user_id,
            event_id=volunteer.event_id,
            status=volunteer.status,
            created_at=volunteer.created_at,
            student_name=student.name,
            student_email=user.email,
            attended=volunteer.attended,
            qr_code=volunteer.qr_code,
            checked_in_at=volunteer.checked_in_at
        )
        volunteers_resp.append(v_resp)
    
    return volunteers_resp

@router.put("/volunteers/{volunteer_id}", response_model=VolunteerResponse)
async def update_volunteer_status(volunteer_id: int, update_data: VolunteerUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role not in [UserRole.ORGANIZER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = db.execute(select(Volunteer).where(Volunteer.id == volunteer_id))
    volunteer = result.scalar_one_or_none()
    
    if not volunteer:
        raise HTTPException(status_code=404, detail="Volunteer not found")
        
    volunteer.status = update_data.status
    
    # If approved, remove from bookings to avoid duplication and free up seat
    if update_data.status == "Approved":
        from models import Booking, Student
        from sqlalchemy import delete
        
        # Find student ID associated with this user
        student_res = db.execute(select(Student).where(Student.user_id == volunteer.user_id))
        student = student_res.scalar_one_or_none()
        
        if student:
            # Check if booking exists
            booking_res = db.execute(select(Booking).where(
                Booking.event_id == volunteer.event_id,
                Booking.student_id == student.id
            ))
            booking = booking_res.scalar_one_or_none()
            
            if booking:
                # Delete booking
                db.delete(booking)
                
                # Free up the seat
                event_res = db.execute(select(Event).where(Event.id == volunteer.event_id))
                event = event_res.scalar_one_or_none()
                if event:
                    event.seats_available += 1
        
        # Generate QR code for volunteer
        from qr_utils import generate_qr_code
        qr_data, qr_image = generate_qr_code("volunteer", volunteer.id)
        volunteer.qr_code = qr_data
        
        # Send volunteer ticket email
        try:
            from email_service import send_booking_ticket
            # Get event details
            event_res = db.execute(select(Event).where(Event.id == volunteer.event_id))
            event = event_res.scalar_one_or_none()
            
            # Get user details
            user_res = db.execute(select(User).where(User.id == volunteer.user_id))
            user = user_res.scalar_one_or_none()
            
            student_res = db.execute(select(Student).where(Student.user_id == volunteer.user_id))
            student = student_res.scalar_one_or_none()
            
            if event and user and student:
                send_booking_ticket(
                    email=user.email,
                    student_name=student.name,
                    event_title=event.title,
                    event_date=event.date,
                    event_time=event.time,
                    event_venue=event.venue,
                    qr_image=qr_image,
                    qr_data=qr_data,
                    ticket_type="volunteer"
                )
        except Exception as e:
            print(f"Failed to send volunteer email: {e}")
    
    db.commit()
    db.refresh(volunteer)
    return volunteer
