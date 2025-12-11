from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Enum, Table, JSON
from sqlalchemy.orm import relationship
from database import Base
import enum

class UserRole(str, enum.Enum):
    STUDENT = "student"
    ORGANIZER = "organizer"
    ADMIN = "admin"

# Association Table for Followers
user_follows = Table(
    "user_follows",
    Base.metadata,
    Column("follower_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("followed_id", Integer, ForeignKey("users.id"), primary_key=True),
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(Enum(UserRole))
    is_active = Column(Boolean, default=True)
    organization_name = Column(String, nullable=True)
    contact = Column(String, nullable=True)
    
    student_profile = relationship("Student", back_populates="user", uselist=False)
    organizer_profile = relationship("Organizer", back_populates="user", uselist=False)
    media = relationship("Media", back_populates="user")
    posts = relationship("FeedPost", back_populates="user")
    likes = relationship("FeedLike", back_populates="user")
    comments = relationship("FeedComment", back_populates="user")
    
    # Social - Self-referential Many-to-Many for followers
    followers = relationship(
        "User",
        secondary=user_follows,
        primaryjoin=id==user_follows.c.followed_id,
        secondaryjoin=id==user_follows.c.follower_id,
        backref="following"
    )

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, index=True)
    contact = Column(String)
    department = Column(String)
    enrollment_number = Column(String, unique=True, index=True)
    
    # Gamification
    badges = Column(JSON, default=list) # List of badge objects
    inventory = Column(JSON, default=list) # List of all purchased items (badges, effects, etc.)
    unlocked_features = Column(JSON, default=list) # List of unlocked feature strings
    weekly_rank = Column(Integer, default=0)
    title = Column(String, nullable=True) # e.g. "Tech Wizard"
    active_effect = Column(String, nullable=True) # Currently equipped profile effect
    spent_points = Column(Integer, default=0)

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
    date = Column(String) 
    time = Column(String)
    end_time = Column(String, nullable=True) # e.g. "12:00 PM"
    venue = Column(String)
    image_url = Column(String, nullable=True) 
    images = Column(String, nullable=True) 
    department = Column(String, nullable=True)
    open_for = Column(String, nullable=True)
    outcomes = Column(String, nullable=True)
    is_paid = Column(Boolean, default=False)
    price = Column(Integer, default=0)
    hashtags = Column(String, nullable=True) 
    status = Column(String, default="Upcoming") 

    organizer = relationship("Organizer", back_populates="events")
    bookings = relationship("Booking", back_populates="event")
    media = relationship("Media", back_populates="event")
    waitlist = relationship("Waitlist", back_populates="event")

class Waitlist(Base):
    __tablename__ = "waitlist"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    event_id = Column(Integer, ForeignKey("events.id"))
    created_at = Column(String) 

    user = relationship("User")
    event = relationship("Event", back_populates="waitlist")

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    student_id = Column(Integer, ForeignKey("students.id"))
    booking_date = Column(String) 
    status = Column(String, default="Confirmed")
    
    # Attendance tracking
    attended = Column(Boolean, default=False)
    qr_code = Column(String, unique=True, nullable=True, index=True)
    checked_in_at = Column(String, nullable=True) 
    
    # Feedback
    rating = Column(Integer, nullable=True)
    review = Column(String, nullable=True) 

    event = relationship("Event", back_populates="bookings")
    student = relationship("Student", back_populates="bookings")

class Media(Base):
    __tablename__ = "media"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    url = Column(String)
    type = Column(String) 
    caption = Column(String, nullable=True)
    uploaded_at = Column(String) 
    is_approved = Column(Boolean, default=False) 

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
    created_at = Column(String) 

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
    created_at = Column(String) 

class FeedPost(Base):
    __tablename__ = "feed_posts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(String, nullable=True)
    media_urls = Column(JSON, nullable=True) # List of image URLs
    media_type = Column(String, default="image") 
    event_id = Column(Integer, ForeignKey("events.id"), nullable=True) # Main relevant event
    location = Column(String, nullable=True)
    feeling = Column(String, nullable=True)
    tagged_users = Column(JSON, nullable=True) # List of user IDs
    tagged_events = Column(JSON, nullable=True) # List of event IDs
    created_at = Column(String) 
    
    user = relationship("User", back_populates="posts")
    event = relationship("Event")
    likes = relationship("FeedLike", back_populates="post", cascade="all, delete-orphan")
    comments = relationship("FeedComment", back_populates="post", cascade="all, delete-orphan")

class FeedLike(Base):
    __tablename__ = "feed_likes"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("feed_posts.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    reaction_type = Column(String, default="like") # like, love, fire, haha, wow, sad
    created_at = Column(String)

    post = relationship("FeedPost", back_populates="likes")
    user = relationship("User", back_populates="likes")

class FeedComment(Base):
    __tablename__ = "feed_comments"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("feed_posts.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    parent_id = Column(Integer, ForeignKey("feed_comments.id"), nullable=True) # For replies
    content = Column(String)
    created_at = Column(String)

    post = relationship("FeedPost", back_populates="comments")
    user = relationship("User", back_populates="comments")
    replies = relationship("FeedComment", back_populates="parent", remote_side=[id])
    parent = relationship("FeedComment", back_populates="replies", remote_side=[parent_id])

class Volunteer(Base):
    __tablename__ = "volunteers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    event_id = Column(Integer, ForeignKey("events.id"))
    status = Column(String, default="Pending") 
    created_at = Column(String)
    
    # Attendance tracking
    attended = Column(Boolean, default=False)
    qr_code = Column(String, unique=True, nullable=True, index=True)
    checked_in_at = Column(String, nullable=True)

    user = relationship("User")
    event = relationship("Event")

class PointTransaction(Base):
    __tablename__ = "point_transactions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    amount = Column(Integer) # Positive for earning (optional usage), Negative for spending
    description = Column(String)
    timestamp = Column(String) # ISO format

    student = relationship("Student", back_populates="transactions")

# Add relationship to Student model
Student.transactions = relationship("PointTransaction", back_populates="student")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    message = Column(String)
    type = Column(String) # alert, info, success
    is_read = Column(Boolean, default=False)
    created_at = Column(String)
    data = Column(JSON, nullable=True) # For deep linking e.g. { "event_id": 1 }

    user = relationship("User", back_populates="notifications")

User.notifications = relationship("Notification", back_populates="user")
