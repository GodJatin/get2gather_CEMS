from pydantic import BaseModel, EmailStr, constr, validator
from typing import Optional
from models import UserRole

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role: UserRole

class StudentCreate(BaseModel):
    name: str
    contact: constr(min_length=7, max_length=15)
    email: EmailStr
    department: str
    enrollment_number: constr(min_length=13, max_length=13)
    password: str

    @validator('password')
    def truncate_password(cls, v):
        # Bcrypt has a 72-character limit, truncate to prevent errors
        if len(v) > 72:
            return v[:72]
        return v

    @validator('email')
    def validate_email(cls, v):
        if not v.endswith('@paruluniversity.ac.in'):
            raise ValueError('Email must be from @paruluniversity.ac.in')
        if not v.split('@')[0].isdigit() or len(v.split('@')[0]) != 13:
             raise ValueError('Email prefix must be 13 digits')
        return v

    @validator('enrollment_number')
    def validate_enrollment(cls, v, values):
        if 'email' in values:
            email_prefix = values['email'].split('@')[0]
            if v != email_prefix:
                raise ValueError('Enrollment number must match email digits')
        return v

class OrganizerCreate(BaseModel):
    organization_name: str
    email: EmailStr
    contact: str
    password: str

class OrganizerSignupInitiate(BaseModel):
    email: EmailStr
    organization_name: str
    contact: str
    invite_code: str

class OrganizerSignupVerify(BaseModel):
    email: EmailStr
    otp: str

class OrganizerSignupComplete(BaseModel):
    email: EmailStr
    password: str

class StudentSignupInitiate(BaseModel):
    name: str
    contact: str
    email: EmailStr
    
    @validator('email')
    def validate_email(cls, v):
        if not v.endswith('@paruluniversity.ac.in'):
            raise ValueError('Email must be from @paruluniversity.ac.in')
        if not v.split('@')[0].isdigit() or len(v.split('@')[0]) != 13:
             raise ValueError('Email prefix must be 13 digits')
        return v

class StudentSignupVerify(BaseModel):
    email: EmailStr
    otp: str

class StudentSignupComplete(BaseModel):
    email: EmailStr
    department: str
    password: str
    
    @validator('password')
    def truncate_password(cls, v):
        if len(v) > 72:
            return v[:72]
        return v

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class EventBase(BaseModel):
    title: str
    description: str
    category: str
    capacity: int
    date: str
    time: str
    venue: str
    image_url: Optional[str] = None

class EventCreate(EventBase):
    pass

class EventResponse(EventBase):
    id: int
    organizer_id: int
    seats_available: int
    status: str

    class Config:
        orm_mode = True

class BookingCreate(BaseModel):
    event_id: int

class BookingResponse(BaseModel):
    id: int
    event_id: int
    student_id: int
    status: str
    booking_date: str

    class Config:
        orm_mode = True

class MediaCreate(BaseModel):
    event_id: int
    url: str
    type: str
    caption: Optional[str] = None

class MediaResponse(BaseModel):
    id: int
    event_id: int
    user_id: int
    url: str
    type: str
    caption: Optional[str] = None
    uploaded_at: str
    is_approved: bool

    class Config:
        orm_mode = True



