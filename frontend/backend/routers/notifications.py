from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models
from routers.auth import get_current_user
from datetime import datetime

router = APIRouter(
    prefix="/notifications",
    tags=["notifications"],
    responses={404: {"description": "Not found"}},
)

@router.get("/")
async def get_notifications(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 20,
    offset: int = 0
):
    notifications = db.query(models.Notification)\
        .filter(models.Notification.user_id == current_user.id)\
        .order_by(models.Notification.id.desc())\
        .limit(limit)\
        .offset(offset)\
        .all()
    return notifications

@router.get("/unread-count")
async def get_unread_count(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    count = db.query(models.Notification)\
        .filter(models.Notification.user_id == current_user.id, models.Notification.is_read == False)\
        .count()
    return {"count": count}

@router.put("/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notification = db.query(models.Notification)\
        .filter(models.Notification.id == notification_id, models.Notification.user_id == current_user.id)\
        .first()
        
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notification.is_read = True
    db.commit()
    return {"status": "success"}

@router.put("/read-all")
async def mark_all_read(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(models.Notification)\
        .filter(models.Notification.user_id == current_user.id, models.Notification.is_read == False)\
        .update({models.Notification.is_read: True})
    
    db.commit()
    return {"status": "success"}

# Internal helper to create notification (not an endpoint)
def create_notification(db: Session, user_id: int, title: str, message: str, type: str = "info", data: dict = None):
    new_notif = models.Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=type,
        created_at=datetime.now().isoformat(),
        data=data
    )
    db.add(new_notif)
    db.commit()
    return new_notif
