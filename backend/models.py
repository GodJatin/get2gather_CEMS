from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from database import Base
import enum

class UserRole(str, enum.Enum):
    STUDENT = "student"
    ORGANIZER = "organizer"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(Enum(UserRole))
    is_active = Column(Boolean, default=True)

    student_profile = relationship("Student", back_populates="user", uselist=False)
    organizer_profile = relationship("Organizer", back_populates="user", uselist=False)
    media = relationship("Media", back_populates="user")
    posts = relationship("FeedPost", back_populates="user")
    likes = relationship("FeedLike", back_populates="user")
    comments = relationship("FeedComment", back_populates="user")

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    contact = Column(String)
    department = Column(String)
    enrollment_number = Column(String, unique=True, index=True)
    
    user = relationship("User", back_populates="student_profile")
    bookings = relationship("Booking", back_populates="student")


class Organizer(Base):
    __tablename__ = "organizers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    organization_name = Column(String)
    contact = Column(String)
    
    user = relationship("User", back_populates="organizer_profile")
    events = relationship("Event", back_populates="organizer")

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    organizer_id = Column(Integer, ForeignKey("organizers.id"))
    title = Column(String, index=True)
    description = Column(String)
    category = Column(String)
    capacity = Column(Integer)
    seats_available = Column(Integer)
    date = Column(String) # Storing as string for simplicity, can be DateTime
    time = Column(String)
    venue = Column(String)
    image_url = Column(String, nullable=True) # Main thumbnail
    images = Column(String, nullable=True) # JSON string for multiple images
    department = Column(String, nullable=True)
    open_for = Column(String, nullable=True)
    outcomes = Column(String, nullable=True)
    is_paid = Column(Boolean, default=False)
    price = Column(Integer, default=0)
    status = Column(String, default="Upcoming") # Upcoming, Ongoing, Completed

    organizer = relationship("Organizer", back_populates="events")
    bookings = relationship("Booking", back_populates="event")
    media = relationship("Media", back_populates="event")
    waitlist = relationship("Waitlist", back_populates="event")

class Waitlist(Base):
    __tablename__ = "waitlist"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    event_id = Column(Integer, ForeignKey("events.id"))
    created_at = Column(String) # Store timestamp

    user = relationship("User")
    event = relationship("Event", back_populates="waitlist")

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    student_id = Column(Integer, ForeignKey("students.id"))
    booking_date = Column(String) # Store as ISO string
    status = Column(String, default="Confirmed") # Confirmed, Cancelled

    event = relationship("Event", back_populates="bookings")
    student = relationship("Student", back_populates="bookings")

class Media(Base):
    __tablename__ = "media"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    url = Column(String)
    type = Column(String) # image, video
    caption = Column(String, nullable=True)
    uploaded_at = Column(String) # ISO string
    is_approved = Column(Boolean, default=False) # For moderation

    event = relationship("Event", back_populates="media")
    user = relationship("User", back_populates="media")

class OrganizerInvite(Base):
    __tablename__ = "organizer_invites"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    invite_code = Column(String)
    is_used = Column(Boolean, default=False)

class RegistrationAttempt(Base):
    __tablename__ = "registration_attempts"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    otp = Column(String)
    organization_name = Column(String)
    contact = Column(String)
    invite_code = Column(String)
    is_verified = Column(Boolean, default=False)
    created_at = Column(String) # Store as ISO string for simplicity

class StudentRegistrationAttempt(Base):
    __tablename__ = "student_registration_attempts"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    otp = Column(String)
    name = Column(String)
    contact = Column(String)
    department = Column(String)
    enrollment_number = Column(String)
    is_verified = Column(Boolean, default=False)
    created_at = Column(String) # Store as ISO string for simplicity

class FeedPost(Base):
    __tablename__ = "feed_posts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(String, nullable=True)
    media_url = Column(String, nullable=True)
    media_type = Column(String, nullable=True) # image, video
    event_id = Column(Integer, ForeignKey("events.id"), nullable=True)
    location = Column(String, nullable=True)
    feeling = Column(String, nullable=True)
    tagged_users = Column(String, nullable=True) # JSON string of user_ids
    created_at = Column(String) # ISO string
    
    user = relationship("User", back_populates="posts")
    event = relationship("Event")
    likes = relationship("FeedLike", back_populates="post", cascade="all, delete-orphan")
    comments = relationship("FeedComment", back_populates="post", cascade="all, delete-orphan")

class FeedLike(Base):
    __tablename__ = "feed_likes"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("feed_posts.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(String)

    post = relationship("FeedPost", back_populates="likes")
    user = relationship("User", back_populates="likes")

class FeedComment(Base):
    __tablename__ = "feed_comments"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("feed_posts.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(String)
    created_at = Column(String)

    post = relationship("FeedPost", back_populates="comments")
    user = relationship("User", back_populates="comments")

class Volunteer(Base):
    __tablename__ = "volunteers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    event_id = Column(Integer, ForeignKey("events.id"))
    status = Column(String, default="Pending") # Pending, Approved, Rejected
    created_at = Column(String)

    user = relationship("User")
    event = relationship("Event")
