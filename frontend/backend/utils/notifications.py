from sqlalchemy.orm import Session
from models import Notification, Student, User
from datetime import datetime, timezone
from typing import List, Optional

def create_notification(db: Session, user_id: int, title: str, message: str, type: str = "info", data: dict = None):
    """
    Create a single notification for a user.
    """
    new_notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=type,
        created_at=datetime.now(timezone.utc).isoformat(),
        data=data
    )
    db.add(new_notif)
    db.commit()
    return new_notif

def create_broadcast_notification(db: Session, title: str, message: str, type: str = "info", data: dict = None, role: str = None):
    """
    Create a notification for ALL users (or specific role).
    Warning: This can be heavy if there are thousands of users.
    """
    # Build query
    query = db.query(User)
    if role:
        # If role is passed, filter. Handle both Enum and string just in case.
        # Assuming database stores the string value of the enum.
        query = query.filter(User.role == str(role))
    
    users = query.all()
    print(f"DEBUG: Broadcast to role='{role}'. Found {len(users)} users.")
    
    notifications = []
    timestamp = datetime.now(timezone.utc).isoformat()
    
    for user in users:
        notifications.append(Notification(
            user_id=user.id,
            title=title,
            message=message,
            type=type,
            created_at=timestamp,
            data=data
        ))
    
    if notifications:
        db.add_all(notifications)
        db.commit()
        
    return len(notifications)
