from pydantic import BaseModel, EmailStr, constr, validator
from typing import Optional, List
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

    class Config:
        orm_mode = True
        from_attributes = True

class EventCreate(EventBase):
    # Optional fields that frontend may send
    venue: Optional[str] = None
    department: Optional[str] = None
    open_for: Optional[str] = None
    outcomes: Optional[str] = None
    images: Optional[str] = None
    image_url: Optional[str] = None
    is_paid: Optional[bool] = False
    price: Optional[int] = 0
    hashtags: Optional[str] = None
    # These are set by backend, so frontend shouldn't send them
    # organizer_id, seats_available, status will be set server-side

class EventResponse(EventBase):
    id: int
    seats_available: int
    organizer_id: int
    status: str
    image_url: Optional[str] = None
    images: Optional[str] = None
    venue: Optional[str] = None
    department: Optional[str] = None
    open_for: Optional[str] = None
    outcomes: Optional[str] = None
    is_paid: bool = False
    price: int = 0
    hashtags: Optional[str] = None

    class Config:
        orm_mode = True
        from_attributes = True

class WaitlistBase(BaseModel):
    event_id: int

class WaitlistCreate(WaitlistBase):
    pass

class WaitlistResponse(WaitlistBase):
    id: int
    user_id: int
    created_at: str

    class Config:
        orm_mode = True
        from_attributes = True

class BookingCreate(BaseModel):
    event_id: int

class BookingResponse(BaseModel):
    id: int
    event_id: int
    student_id: int
    status: str
    booking_date: str
    event_title: Optional[str] = None
    event_date: Optional[str] = None
    event_time: Optional[str] = None
    event_venue: Optional[str] = None
    student_name: Optional[str] = None
    student_email: Optional[str] = None
    # Attendance tracking
    attended: Optional[bool] = False
    qr_code: Optional[str] = None
    checked_in_at: Optional[str] = None
    rating: Optional[int] = None
    review: Optional[str] = None

    class Config:
        orm_mode = True
        from_attributes = True

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
        from_attributes = True

class FeedPostCreate(BaseModel):
    content: Optional[str] = None
    media_urls: Optional[List[str]] = []
    media_type: Optional[str] = "image"
    event_id: Optional[int] = None
    location: Optional[str] = None
    feeling: Optional[str] = None
    tagged_users: Optional[List[int]] = []
    tagged_events: Optional[List[int]] = []

class FeedCommentCreate(BaseModel):
    content: str

class FeedCommentResponse(BaseModel):
    id: int
    user_id: int
    content: str
    created_at: str
    user_name: Optional[str] = None

    class Config:
        orm_mode = True
        from_attributes = True

class FeedPostResponse(BaseModel):
    id: int
    user_id: int
    content: Optional[str]
    media_urls: Optional[List[str]]
    media_type: Optional[str]
    event_id: Optional[int]
    location: Optional[str]
    feeling: Optional[str]
    tagged_users: Optional[List[int]]
    tagged_events: Optional[List[int]]
    created_at: str
    user_name: Optional[str] = None
    user_role: Optional[str] = None
    event_title: Optional[str] = None
    likes_count: int
    comments_count: int
    is_liked: bool = False
    current_user_reaction: Optional[str] = None
    is_following: bool = False
    comments: List[FeedCommentResponse] = []

    class Config:
        orm_mode = True
        from_attributes = True

class VolunteerCreate(BaseModel):
    pass

class VolunteerUpdate(BaseModel):
    status: str

class VolunteerResponse(BaseModel):
    id: int
    user_id: int
    event_id: int
    status: str
    created_at: str
    student_name: Optional[str] = None
    student_email: Optional[str] = None
    # Attendance tracking
    attended: Optional[bool] = False
    qr_code: Optional[str] = None
    checked_in_at: Optional[str] = None

    class Config:
        orm_mode = True
        from_attributes = True
