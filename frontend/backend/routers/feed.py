from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select, desc
from database import get_db
from models import FeedPost, User
from routers.auth import get_current_user
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter(prefix="/feed", tags=["feed"])

# Minimal Schema
class SimplePostCreate(BaseModel):
    content: str

class SimplePostResponse(BaseModel):
    id: int
    content: str
    user_name: str
    created_at: datetime
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[SimplePostResponse])
async def get_feed(db: Session = Depends(get_db)):
    try:
        # Simple fetch, newest first
        results = db.execute(
            select(FeedPost, User.full_name)
            .join(User, FeedPost.user_id == User.id)
            .order_by(desc(FeedPost.created_at))
            .limit(20)
        ).all()
        
        posts = []
        for post, user_name in results:
            posts.append(SimplePostResponse(
                id=post.id,
                content=post.content,
                user_name=user_name or "Unknown",
                created_at=post.created_at
            ))
            
        return posts
    except Exception as e:
        print(f"FEED ERROR: {e}")
        return []

@router.post("/", response_model=SimplePostResponse)
async def create_post(
    post_data: SimplePostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        print(f"Creating simple post for {current_user.full_name}")
        new_post = FeedPost(
            user_id=current_user.id,
            content=post_data.content,
            created_at=datetime.utcnow(),
            media_urls=[], # Explicitly empty
            media_type='text'
        )
        db.add(new_post)
        db.commit()
        db.refresh(new_post)
        
        return SimplePostResponse(
            id=new_post.id, 
            content=new_post.content,
            user_name=current_user.full_name or "Me",
            created_at=new_post.created_at
        )
    except Exception as e:
        print(f"CREATE ERROR: {e}")
        raise HTTPException(status_code=500, detail="Failed to post")
