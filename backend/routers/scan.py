from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.future import select
from database import get_db
from models import User, UserRole, Booking, Student, Event, Volunteer
from routers.auth import get_current_user
from pydantic import BaseModel
from datetime import datetime, timedelta
from points_utils import POINTS_PER_BOOKING, POINTS_PER_VOLUNTEER

router = APIRouter(tags=["Scan"])

class CheckinRequest(BaseModel):
    qr_data: str

class CheckinResponse(BaseModel):
    success: bool
    message: str
    student_name: str
    event_title: str
    points_earned: int
    attendance_type: str  # "attendee" or "volunteer"

@router.post("/scan/checkin", response_model=CheckinResponse)
async def checkin_scan(
    data: CheckinRequest, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """
    Scan QR code to mark attendance
    - Only works 1 hour before event time
    - Credits points after successful scan
    - Sends confirmation email
    """
    if current_user.role not in [UserRole.ORGANIZER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Only organizers can scan QR codes")
    
    # Parse QR data: "booking:123:token" or "volunteer:456:token"
    try:
        parts = data.qr_data.split(":")
        if len(parts) != 3:
            raise ValueError("Invalid format")
        
        record_type, record_id, token = parts
        record_id = int(record_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid format. Expected 'booking:ID:TOKEN' or 'volunteer:ID:TOKEN'")
    
    if record_type == "booking":
        # Handle booking attendance
        booking = db.execute(select(Booking).where(
            Booking.id == record_id,
            Booking.qr_code == data.qr_data
        )).scalar_one_or_none()
        
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found or QR code mismatch")
        
        if booking.attended:
            raise HTTPException(status_code=400, detail="Already checked in")
        
        # Get event
        event = db.execute(select(Event).where(Event.id == booking.event_id)).scalar_one()
        
        # Check if scan is allowed (1 hour before event)
        try:
            event_datetime = datetime.strptime(f"{event.date} {event.time}", "%Y-%m-%d %I:%M %p")
        except:
            # If time parsing fails, allow scan (fallback)
            event_datetime = datetime.now()
        
        hours_before_event = (event_datetime - datetime.now()).total_seconds() / 3600
        if hours_before_event > 1:
            raise HTTPException(
                status_code=403, 
                detail=f"Check-in opens 1 hour before event. Event starts in {hours_before_event:.1f} hours"
            )
        
        # Mark attended
        booking.attended = True
        booking.checked_in_at = datetime.now().isoformat()
        
        # Get student details
        student = db.execute(select(Student).where(Student.id == booking.student_id)).scalar_one()
        user = db.execute(select(User).where(User.id == student.user_id)).scalar_one()
        
        db.commit()
        
        # Send confirmation email
        try:
            from email_service import send_attendance_confirmation
            send_attendance_confirmation(
                email=user.email,
                student_name=student.name,
                event_title=event.title,
                event_date=event.date,
                event_venue=event.venue,
                points_earned=POINTS_PER_BOOKING,
                attendance_type="attendee"
            )
        except Exception as e:
            print(f"Failed to send attendance email: {e}")
        
        response_data = CheckinResponse(
            success=True,
            message="Check-in successful!",
            student_name=student.name,
            event_title=event.title,
            points_earned=POINTS_PER_BOOKING,
            attendance_type="attendee"
        )
        print(f"DEBUG: Scan successful. Response: {response_data}")
        return response_data
    
    elif record_type == "volunteer":
        # Handle volunteer attendance
        volunteer = db.execute(select(Volunteer).where(
            Volunteer.id == record_id,
            Volunteer.qr_code == data.qr_data
        )).scalar_one_or_none()
        
        if not volunteer:
            raise HTTPException(status_code=404, detail="Volunteer record not found or QR code mismatch")
        
        if volunteer.status != "Approved":
            raise HTTPException(status_code=400, detail="Volunteer application not approved")
        
        if volunteer.attended:
            raise HTTPException(status_code=400, detail="Already checked in")
        
        # Get event
        event = db.execute(select(Event).where(Event.id == volunteer.event_id)).scalar_one()
        
        # Check if scan is allowed (1 hour before event)
        try:
            event_datetime = datetime.strptime(f"{event.date} {event.time}", "%Y-%m-%d %I:%M %p")
        except:
            event_datetime = datetime.now()
        
        hours_before_event = (event_datetime - datetime.now()).total_seconds() / 3600
        if hours_before_event > 1:
            raise HTTPException(
                status_code=403, 
                detail=f"Check-in opens 1 hour before event. Event starts in {hours_before_event:.1f} hours"
            )
        
        # Mark attended
        volunteer.attended = True
        volunteer.checked_in_at = datetime.now().isoformat()
        
        # Get student details
        user = db.execute(select(User).where(User.id == volunteer.user_id)).scalar_one()
        student = db.execute(select(Student).where(Student.user_id == user.id)).scalar_one()
        
        db.commit()
        
        # Send confirmation email
        try:
            from email_service import send_attendance_confirmation
            send_attendance_confirmation(
                email=user.email,
                student_name=student.name,
                event_title=event.title,
                event_date=event.date,
                event_venue=event.venue,
                points_earned=POINTS_PER_VOLUNTEER,
                attendance_type="volunteer"
            )
        except Exception as e:
            print(f"Failed to send attendance email: {e}")
        
        response_data = CheckinResponse(
            success=True,
            message="Check-in successful!",
            student_name=student.name,
            event_title=event.title,
            points_earned=POINTS_PER_VOLUNTEER,
            attendance_type="volunteer"
        )
        print(f"DEBUG: Volunteer scan successful. Response: {response_data}")
        return response_data
    
    else:
        raise HTTPException(status_code=400, detail="Invalid QR code type")
