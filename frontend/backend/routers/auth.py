from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy.future import select
from sqlalchemy import delete
from database import get_db
import os
from models import User, Student, Organizer, UserRole, OrganizerInvite, RegistrationAttempt
from schemas import (
    StudentCreate, OrganizerCreate, Token, UserCreate, TokenData, 
    OrganizerSignupInitiate, OrganizerSignupVerify, OrganizerSignupComplete, 
    StudentSignupInitiate, StudentSignupVerify, StudentSignupComplete,
    OrganizerProfileUpdate
)
from .security_utils import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, SECRET_KEY
from datetime import timedelta
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import JWTError, jwt

router = APIRouter(tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        print(f"DEBUG: get_current_user called with token: {token[:10]}...")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[os.getenv("ALGORITHM", "HS256")])
        email: str = payload.get("sub")
        role: str = payload.get("role")
        if email is None:
            print("DEBUG: Email is None in token payload")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials: Email missing in token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        token_data = TokenData(email=email, role=role)
    except JWTError as e:
        print(f"DEBUG: JWTError: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: JWT Error - {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        print(f"DEBUG: Unexpected error in JWT decode: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: Unexpected - {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        print(f"DEBUG: Querying user {token_data.email}")
        result = db.execute(select(User).where(User.email == token_data.email))
        user = result.scalar_one_or_none()
        if user is None:
            print(f"DEBUG: User {token_data.email} not found in DB")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Could not validate credentials: User {token_data.email} not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        print(f"DEBUG: User found: {user.id}")
        return user
    except Exception as e:
        print(f"CRITICAL ERROR in get_current_user DB query: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Auth Dependency Failed: {str(e)}"
        )

@router.get("/auth/me")
async def read_users_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Get current user details including profile information
    """
    try:
        print(f"DEBUG: /auth/me called for user {current_user.email} ({current_user.role})")
        
        user_data = {
            "id": current_user.id,
            "email": current_user.email,
            "role": current_user.role,
            "is_active": current_user.is_active,
            # Defaults to prevent frontend crash if profile is missing
            "name": "Student",
            "department": "N/A",
            "enrollment_number": "N/A",
            "total_points": 0,
            "spent_points": 0,
            "available_points": 0,
            "bookings_count": 0,
            "posts_count": 0,
            "volunteer_count": 0,
            "title": "Newcomer",
            "badges": []
        }

        if current_user.role == UserRole.STUDENT:
            print("Fetching student profile...")
            # Fetch student profile (Columns only to avoid MissingGreenlet)
            result = db.execute(select(
                Student.id, 
                Student.name, 
                Student.department, 
                Student.enrollment_number,
                Student.title,
                Student.badges
            ).where(Student.user_id == current_user.id))
            student = result.first() # Returns a Row
            
            if student:
                print(f"Student found: {student.id}")
                user_data["name"] = student.name
                user_data["department"] = student.department
                user_data["enrollment_number"] = student.enrollment_number
                
                # Gamification & Points (Centralized)
                from points_utils import calculate_student_points, calculate_gamification
                print("Calculating points...")
                points_data = calculate_student_points(db, student.id, current_user.id)
                print(f"Points calculated: {points_data}")
                
                user_data.update(points_data)
                
                print("Calculating gamification...")
                gamification_data = calculate_gamification(student, points_data)
                print(f"Gamification calculated: {gamification_data}")
                
                user_data["title"] = gamification_data["title"]
                user_data["badges"] = gamification_data["badges"]
            else:
                print("Student profile not found, returning defaults")
                
        elif current_user.role == UserRole.ORGANIZER:
            # Fetch organizer profile
            result = db.execute(select(Organizer).where(Organizer.user_id == current_user.id))
            organizer = result.scalar_one_or_none()
            if organizer:
                from models import Event, Booking
                from sqlalchemy import func
                
                user_data["name"] = organizer.organization_name
                user_data["contact"] = organizer.contact
                user_data["organizer_id"] = organizer.id
                
                # Get event statistics
                events_result = db.execute(select(func.count()).select_from(Event).where(Event.organizer_id == organizer.id))
                total_events = events_result.scalar() or 0
                user_data["total_events"] = total_events
                
                # Get total bookings across all events
                bookings_result = db.execute(
                    select(func.count())
                    .select_from(Booking)
                    .join(Event, Event.id == Booking.event_id)
                    .where(Event.organizer_id == organizer.id)
                )
                total_attendees = bookings_result.scalar() or 0
                user_data["total_attendees"] = total_attendees

        return user_data

    except Exception as e:
        print(f"CRITICAL ERROR in /auth/me: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"detail": f"Profile fetch failed: {str(e)}", "trace": traceback.format_exc()}
        )

@router.put("/auth/organizer/profile")
async def update_organizer_profile(data: OrganizerProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.ORGANIZER:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Update User Table
    if data.organization_name:
        current_user.organization_name = data.organization_name
    if data.contact:
        current_user.contact = data.contact
        
    # Update Organizer Table
    result = db.execute(select(Organizer).where(Organizer.user_id == current_user.id))
    organizer = result.scalar_one_or_none()
    
    if organizer:
        if data.organization_name:
            organizer.organization_name = data.organization_name
        if data.contact:
            organizer.contact = data.contact
            
    db.commit()
    return {"message": "Profile updated successfully"}

@router.get("/auth/leaderboard")
async def get_leaderboard(db: Session = Depends(get_db)):
    from models import Student, Booking
    from sqlalchemy import func, desc
    
    # Top 10 students by bookings
    result = db.execute(
        select(Student, func.count(Booking.id).label("bookings_count"))
        .outerjoin(Booking, Student.id == Booking.student_id)
        .group_by(Student.id)
        .order_by(desc("bookings_count"))
        .limit(10)
    )
    
    leaderboard = []
    for student, count in result:
        leaderboard.append({
            "name": student.name,
            "department": student.department,
            "bookings_count": count,
            "points": count * 100 # Mock points
        })
        
    return leaderboard

class EmailCheck(BaseModel):
    email: str

@router.post("/auth/check-email")
async def check_email(email_data: EmailCheck, db: Session = Depends(get_db)):
    result = db.execute(select(User).where(User.email == email_data.email))
    user = result.scalar_one_or_none()
    return {"exists": user is not None}

@router.post("/auth/student/initiate")
async def initiate_student_signup(data: StudentSignupInitiate, db: Session = Depends(get_db)):
    from models import StudentRegistrationAttempt
    from email_service import generate_otp, send_otp_email
    
    # Check if user exists
    result = db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Generate OTP
    otp = generate_otp()
    
    # Send OTP via email
    email_sent, error_msg = send_otp_email(data.email, otp, user_type="student")
    if not email_sent:
        raise HTTPException(status_code=500, detail=f"Failed to send verification email: {error_msg}")
    
    print(f"\nOTP for {data.email}: {otp}\n")
    
    # Auto-fill enrollment from email
    enrollment = data.email.split('@')[0]
    
    # Store Registration Attempt
    result = db.execute(select(StudentRegistrationAttempt).where(StudentRegistrationAttempt.email == data.email))
    attempt = result.scalar_one_or_none()
    
    if attempt:
        attempt.otp = otp
        attempt.name = data.name
        attempt.contact = data.contact
        attempt.enrollment_number = enrollment
        attempt.is_verified = False
    else:
        attempt = StudentRegistrationAttempt(
            email=data.email,
            otp=otp,
            name=data.name,
            contact=data.contact,
            enrollment_number=enrollment,
            is_verified=False
        )
        db.add(attempt)
    
    db.commit()
    return {"message": "OTP sent to your email"}

@router.post("/auth/student/verify")
async def verify_student_otp(data: StudentSignupVerify, db: Session = Depends(get_db)):
    from models import StudentRegistrationAttempt
    
    result = db.execute(select(StudentRegistrationAttempt).where(StudentRegistrationAttempt.email == data.email))
    attempt = result.scalar_one_or_none()

    print(f"\n🔍 DEBUG VERIFY: Email={data.email}, Received OTP='{data.otp}'")

    if not attempt:
        print("❌ DEBUG VERIFY: Attempt not found in DB")
        raise HTTPException(status_code=400, detail="Registration attempt not found")
    
    print(f"🔍 DEBUG VERIFY: Found Attempt ID={attempt.id}, Stored OTP='{attempt.otp}'")

    if attempt.otp != data.otp:
        print(f"❌ DEBUG VERIFY: MISMATCH! '{attempt.otp}' != '{data.otp}'")
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    attempt.is_verified = True
    db.commit()
    return {
        "message": "Email verified successfully",
        "enrollment_number": attempt.enrollment_number
    }

@router.post("/auth/student/complete", response_model=Token)
async def complete_student_signup(data: StudentSignupComplete, db: Session = Depends(get_db)):
    from models import StudentRegistrationAttempt
    
    # Verify Attempt
    result = db.execute(select(StudentRegistrationAttempt).where(StudentRegistrationAttempt.email == data.email))
    attempt = result.scalar_one_or_none()

    if not attempt or not attempt.is_verified:
        raise HTTPException(status_code=400, detail="Email not verified")

    # Create User
    hashed_pw = get_password_hash(data.password)
    new_user = User(email=data.email, hashed_password=hashed_pw, role=UserRole.STUDENT)
    db.add(new_user)
    db.flush()
    
    # Create Student Profile
    new_student = Student(
        user_id=new_user.id,
        name=attempt.name,
        contact=attempt.contact,
        department=data.department,
        enrollment_number=attempt.enrollment_number
    )
    db.add(new_student)

    # Cleanup Attempt
    db.execute(delete(StudentRegistrationAttempt).where(StudentRegistrationAttempt.email == data.email))
    db.commit()

    # Generate Token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user.email, "role": "student"}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "role": "student"}

@router.post("/auth/signup/student", response_model=Token)
async def signup_student(student_data: StudentCreate, db: Session = Depends(get_db)):
    # Check if user exists
    result = db.execute(select(User).where(User.email == student_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create User
    print(f"\n🔍 DEBUG: Password received: '{student_data.password}'")
    print(f"🔍 DEBUG: Password length: {len(student_data.password)}")
    print(f"🔍 DEBUG: Password type: {type(student_data.password)}")
    
    hashed_pw = get_password_hash(student_data.password)
    new_user = User(email=student_data.email, hashed_password=hashed_pw, role=UserRole.STUDENT)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create Student Profile
    new_student = Student(
        user_id=new_user.id,
        name=student_data.name,
        contact=student_data.contact,
        department=student_data.department,
        enrollment_number=student_data.enrollment_number
    )
    db.add(new_student)
    db.commit()

    # Generate Token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user.email, "role": "student"}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/auth/organizer/initiate")
async def initiate_organizer_signup(data: OrganizerSignupInitiate, db: Session = Depends(get_db)):
    # 1. Check if user already exists
    result = db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    # 2. Validate Invite Code against OrganizerInvite
    result = db.execute(select(OrganizerInvite).where(
        OrganizerInvite.email == data.email,
        OrganizerInvite.invite_code == data.invite_code,
        OrganizerInvite.is_used == False
    ))
    invite = result.scalar_one_or_none()
    if not invite:
        raise HTTPException(status_code=400, detail="Invalid email or invite code")

    # 3. Generate and Send OTP
    from email_service import generate_otp, send_otp_email
    otp = generate_otp()
    
    # Send OTP via email
    email_sent, error_msg = send_otp_email(data.email, otp, user_type="organizer")
    if not email_sent:
        raise HTTPException(status_code=500, detail=f"Failed to send verification email: {error_msg}")
    
    print(f"\nOTP for {data.email}: {otp}\n")

    # 4. Store Registration Attempt
    # Check if attempt exists, update it, or create new
    result = db.execute(select(RegistrationAttempt).where(RegistrationAttempt.email == data.email))
    attempt = result.scalar_one_or_none()
    
    if attempt:
        attempt.otp = otp
        attempt.organization_name = data.organization_name
        attempt.contact = data.contact
        attempt.invite_code = data.invite_code
        attempt.is_verified = False
    else:
        attempt = RegistrationAttempt(
            email=data.email,
            otp=otp,
            organization_name=data.organization_name,
            contact=data.contact,
            invite_code=data.invite_code,
            is_verified=False
        )
        db.add(attempt)
    
    db.commit()
    return {"message": "OTP sent to email (Check console)"}

@router.post("/auth/organizer/verify")
async def verify_organizer_otp(data: OrganizerSignupVerify, db: Session = Depends(get_db)):
    result = db.execute(select(RegistrationAttempt).where(RegistrationAttempt.email == data.email))
    attempt = result.scalar_one_or_none()

    if not attempt:
        raise HTTPException(status_code=400, detail="Registration attempt not found")
    
    if attempt.otp != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    attempt.is_verified = True
    db.commit()
    return {"message": "Email verified successfully"}

@router.post("/auth/organizer/complete", response_model=Token)
async def complete_organizer_signup(data: OrganizerSignupComplete, db: Session = Depends(get_db)):
    # 1. Verify Attempt
    result = db.execute(select(RegistrationAttempt).where(RegistrationAttempt.email == data.email))
    attempt = result.scalar_one_or_none()

    if not attempt or not attempt.is_verified:
        raise HTTPException(status_code=400, detail="Email not verified")

    # Extract values before commit to avoid MissingGreenlet error due to expiration
    org_name = attempt.organization_name
    org_contact = attempt.contact
    org_invite_code = attempt.invite_code

    # 2. Create User
    hashed_pw = get_password_hash(data.password)
    new_user = User(email=data.email, hashed_password=hashed_pw, role=UserRole.ORGANIZER)
    db.add(new_user)
    db.flush() # Flush to get ID
    
    # 3. Create Organizer Profile
    new_organizer = Organizer(
        user_id=new_user.id,
        organization_name=org_name,
        contact=org_contact
    )
    db.add(new_organizer)

    # 4. Mark Invite as Used
    result = db.execute(select(OrganizerInvite).where(
        OrganizerInvite.email == data.email,
        OrganizerInvite.invite_code == org_invite_code
    ))
    invite = result.scalar_one_or_none()
    if invite:
        invite.is_used = True

    # 5. Cleanup Attempt
    db.execute(delete(RegistrationAttempt).where(RegistrationAttempt.email == data.email))
    
    db.commit()
    
    # 6. Generate Token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user.email, "role": "organizer"}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "role": "organizer"}

@router.post("/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    try:
        # Find User
        result = db.execute(select(User).where(User.email == form_data.username))
        user = result.scalar_one_or_none()
        
        if not user:
            # DEBUG: User not found
            from database import DATABASE_URL
            masked_url = DATABASE_URL.split("@")[-1] if "@" in DATABASE_URL else "NO_CREDENTIALS"
            detail_msg = f"User {form_data.username} NOT FOUND in DB connected to: {masked_url}"
            print(detail_msg)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=detail_msg,
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        if not verify_password(form_data.password, user.hashed_password):
            # DEBUG: Password mismatch
            detail_msg = f"Password MISMATCH for {form_data.username}"
            print(detail_msg)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=detail_msg,
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email, "role": user.role.value}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer", "role": user.role.value}
    except HTTPException:
        raise
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        print(f"LOGIN CRASH: {tb}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login Handler Crashed: {str(e)}"
        )
