from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
from models import Volunteer, Event, User, UserRole, Student
from schemas import VolunteerCreate, VolunteerResponse, VolunteerUpdate
from typing import List
from routers.auth import get_current_user
from datetime import datetime

router = APIRouter(tags=["Volunteers"])

@router.post("/events/{event_id}/volunteer", response_model=VolunteerResponse)
async def apply_volunteer(event_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can apply")

    # Check if event exists
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Check if already applied
    result = await db.execute(select(Volunteer).where(Volunteer.user_id == current_user.id, Volunteer.event_id == event_id))
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
    await db.commit()
    await db.refresh(new_volunteer)
    return new_volunteer

@router.get("/events/{event_id}/volunteers", response_model=List[VolunteerResponse])
async def get_event_volunteers(event_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Check permissions (Organizer of event or Admin)
    # For now, allow any organizer to see (simplification) or check ownership
    if current_user.role not in [UserRole.ORGANIZER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")

    result = await db.execute(select(Volunteer).where(Volunteer.event_id == event_id))
    volunteers = result.scalars().all()
    
    # Enrich with student details? 
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
from models import Volunteer, Event, User, UserRole, Student
from schemas import VolunteerCreate, VolunteerResponse, VolunteerUpdate
from typing import List
from routers.auth import get_current_user
from datetime import datetime

router = APIRouter(tags=["Volunteers"])

@router.post("/events/{event_id}/volunteer", response_model=VolunteerResponse)
async def apply_volunteer(event_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can apply")

    # Check if event exists
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Check if already applied
    result = await db.execute(select(Volunteer).where(Volunteer.user_id == current_user.id, Volunteer.event_id == event_id))
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
    await db.commit()
    await db.refresh(new_volunteer)
    return new_volunteer

@router.get("/events/{event_id}/volunteers", response_model=List[VolunteerResponse])
async def get_event_volunteers(event_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Check permissions (Organizer of event or Admin)
    # For now, allow any organizer to see (simplification) or check ownership
    if current_user.role not in [UserRole.ORGANIZER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")

    result = await db.execute(select(Volunteer).where(Volunteer.event_id == event_id))
    volunteers = result.scalars().all()
    
    # Enrich with student details? 
    # Similar to bookings, we might need student info.
    # Let's handle that in the response model or query.
    
    return volunteers

@router.put("/volunteers/{volunteer_id}", response_model=VolunteerResponse)
async def update_volunteer_status(volunteer_id: int, update_data: VolunteerUpdate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role not in [UserRole.ORGANIZER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = await db.execute(select(Volunteer).where(Volunteer.id == volunteer_id))
    volunteer = result.scalar_one_or_none()
    
    if not volunteer:
        raise HTTPException(status_code=404, detail="Volunteer not found")
        
    volunteer.status = update_data.status
    
    # If approved, remove from bookings to avoid duplication
    if update_data.status == "Approved":
        from models import Booking, Student
        from sqlalchemy import delete
        
        # Find student ID associated with this user
        student_res = await db.execute(select(Student).where(Student.user_id == volunteer.user_id))
        student = student_res.scalar_one_or_none()
        
        if student:
            # Delete booking
            await db.execute(delete(Booking).where(
                Booking.event_id == volunteer.event_id,
                Booking.student_id == student.id
            ))
    
    await db.commit()
    await db.refresh(volunteer)
    return volunteer
