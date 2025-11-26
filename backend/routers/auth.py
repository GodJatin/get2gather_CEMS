from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from database import get_db
import os
from models import User, Student, Organizer, UserRole, OrganizerInvite, RegistrationAttempt
from schemas import StudentCreate, OrganizerCreate, Token, UserCreate
from .security_utils import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import JWTError, jwt
from schemas import StudentCreate, OrganizerCreate, Token, UserCreate, TokenData, OrganizerSignupInitiate, OrganizerSignupVerify, OrganizerSignupComplete, StudentSignupInitiate, StudentSignupVerify, StudentSignupComplete

router = APIRouter(tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=[os.getenv("ALGORITHM", "HS256")])
        email: str = payload.get("sub")
        role: str = payload.get("role")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email, role=role)
    except JWTError:
        raise credentials_exception
    
    result = await db.execute(select(User).where(User.email == token_data.email))
    user = result.scalar_one_or_none()
    if user is None:
        raise credentials_exception
    return user

@router.get("/auth/me")
async def read_users_me(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """
    Get current user details including profile information
    """
    user_data = {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
        "is_active": current_user.is_active
    }

    if current_user.role == UserRole.STUDENT:
        # Fetch student profile
        result = await db.execute(select(Student).where(Student.user_id == current_user.id))
        student = result.scalar_one_or_none()
        if student:
            user_data["name"] = student.name
            user_data["department"] = student.department
            user_data["enrollment_number"] = student.enrollment_number
            
            # Get Stats
            from models import Booking, FeedPost
            from sqlalchemy import func
            
            # Bookings Count
            bookings_res = await db.execute(select(func.count()).select_from(Booking).where(Booking.student_id == student.id))
            user_data["bookings_count"] = bookings_res.scalar()
            
            # Posts Count
            posts_res = await db.execute(select(func.count()).select_from(FeedPost).where(FeedPost.user_id == current_user.id))
            user_data["posts_count"] = posts_res.scalar()
            
    elif current_user.role == UserRole.ORGANIZER:
        # Fetch organizer profile
        result = await db.execute(select(Organizer).where(Organizer.user_id == current_user.id))
        organizer = result.scalar_one_or_none()
        if organizer:
            user_data["name"] = organizer.organization_name
            user_data["contact"] = organizer.contact

    return user_data

@router.get("/auth/leaderboard")
async def get_leaderboard(db: AsyncSession = Depends(get_db)):
    from models import Student, Booking
    from sqlalchemy import func, desc
    
    # Top 10 students by bookings
    result = await db.execute(
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
async def check_email(email_data: EmailCheck, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == email_data.email))
    user = result.scalar_one_or_none()
    return {"exists": user is not None}

@router.post("/auth/student/initiate")
async def initiate_student_signup(data: StudentSignupInitiate, db: AsyncSession = Depends(get_db)):
    from models import StudentRegistrationAttempt
    from email_service import generate_otp, send_otp_email
    
    # Check if user exists
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Generate OTP
    otp = generate_otp()
    
    # Send OTP via email
    email_sent = send_otp_email(data.email, otp, user_type="student")
    if not email_sent:
        raise HTTPException(status_code=500, detail="Failed to send verification email. Please try again.")
    
    print(f"\nOTP for {data.email}: {otp}\n")
    
    # Auto-fill enrollment from email
    enrollment = data.email.split('@')[0]
    
    # Store Registration Attempt
    result = await db.execute(select(StudentRegistrationAttempt).where(StudentRegistrationAttempt.email == data.email))
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
    
    await db.commit()
    return {"message": "OTP sent to your email"}

@router.post("/auth/student/verify")
async def verify_student_otp(data: StudentSignupVerify, db: AsyncSession = Depends(get_db)):
    from models import StudentRegistrationAttempt
    
    result = await db.execute(select(StudentRegistrationAttempt).where(StudentRegistrationAttempt.email == data.email))
    attempt = result.scalar_one_or_none()

    if not attempt:
        raise HTTPException(status_code=400, detail="Registration attempt not found")
    
    if attempt.otp != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    attempt.is_verified = True
    await db.commit()
    return {
        "message": "Email verified successfully",
        "enrollment_number": attempt.enrollment_number
    }

@router.post("/auth/student/complete", response_model=Token)
async def complete_student_signup(data: StudentSignupComplete, db: AsyncSession = Depends(get_db)):
    from models import StudentRegistrationAttempt
    
    # Verify Attempt
    result = await db.execute(select(StudentRegistrationAttempt).where(StudentRegistrationAttempt.email == data.email))
    attempt = result.scalar_one_or_none()

    if not attempt or not attempt.is_verified:
        raise HTTPException(status_code=400, detail="Email not verified")

    # Create User
    hashed_pw = get_password_hash(data.password)
    new_user = User(email=data.email, hashed_password=hashed_pw, role=UserRole.STUDENT)
    db.add(new_user)
    await db.flush()
    
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
    await db.execute(delete(StudentRegistrationAttempt).where(StudentRegistrationAttempt.email == data.email))
    await db.commit()

    # Generate Token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user.email, "role": "student"}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "role": "student"}

@router.post("/auth/signup/student", response_model=Token)
async def signup_student(student_data: StudentCreate, db: AsyncSession = Depends(get_db)):
    # Check if user exists
    result = await db.execute(select(User).where(User.email == student_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create User
    print(f"\n🔍 DEBUG: Password received: '{student_data.password}'")
    print(f"🔍 DEBUG: Password length: {len(student_data.password)}")
    print(f"🔍 DEBUG: Password type: {type(student_data.password)}")
    
    hashed_pw = get_password_hash(student_data.password)
    new_user = User(email=student_data.email, hashed_password=hashed_pw, role=UserRole.STUDENT)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # Create Student Profile
    new_student = Student(
        user_id=new_user.id,
        name=student_data.name,
        contact=student_data.contact,
        department=student_data.department,
        enrollment_number=student_data.enrollment_number
    )
    db.add(new_student)
    await db.commit()

    # Generate Token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user.email, "role": "student"}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/auth/organizer/initiate")
async def initiate_organizer_signup(data: OrganizerSignupInitiate, db: AsyncSession = Depends(get_db)):
    # 1. Check if user already exists
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    # 2. Validate Invite Code against OrganizerInvite
    result = await db.execute(select(OrganizerInvite).where(
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
    email_sent = send_otp_email(data.email, otp, user_type="organizer")
    if not email_sent:
        raise HTTPException(status_code=500, detail="Failed to send verification email. Please try again.")
    
    print(f"\nOTP for {data.email}: {otp}\n")

    # 4. Store Registration Attempt
    # Check if attempt exists, update it, or create new
    result = await db.execute(select(RegistrationAttempt).where(RegistrationAttempt.email == data.email))
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
    
    await db.commit()
    return {"message": "OTP sent to email (Check console)"}

@router.post("/auth/organizer/verify")
async def verify_organizer_otp(data: OrganizerSignupVerify, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(RegistrationAttempt).where(RegistrationAttempt.email == data.email))
    attempt = result.scalar_one_or_none()

    if not attempt:
        raise HTTPException(status_code=400, detail="Registration attempt not found")
    
    if attempt.otp != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    attempt.is_verified = True
    await db.commit()
    return {"message": "Email verified successfully"}

@router.post("/auth/organizer/complete", response_model=Token)
async def complete_organizer_signup(data: OrganizerSignupComplete, db: AsyncSession = Depends(get_db)):
    # 1. Verify Attempt
    result = await db.execute(select(RegistrationAttempt).where(RegistrationAttempt.email == data.email))
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
    await db.flush() # Flush to get ID
    
    # 3. Create Organizer Profile
    new_organizer = Organizer(
        user_id=new_user.id,
        organization_name=org_name,
        contact=org_contact
    )
    db.add(new_organizer)

    # 4. Mark Invite as Used
    result = await db.execute(select(OrganizerInvite).where(
        OrganizerInvite.email == data.email,
        OrganizerInvite.invite_code == org_invite_code
    ))
    invite = result.scalar_one_or_none()
    if invite:
        invite.is_used = True

    # 5. Cleanup Attempt
    await db.execute(delete(RegistrationAttempt).where(RegistrationAttempt.email == data.email))
    
    await db.commit()
    
    # 6. Generate Token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user.email, "role": "organizer"}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "role": "organizer"}

@router.post("/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    # Find User
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role.value}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "role": user.role.value}
