from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc, func
from database import get_db
from models import User, FeedPost, FeedLike, FeedComment, Student, Organizer, UserRole
from schemas import FeedPostCreate, FeedPostResponse, FeedCommentCreate, FeedCommentResponse
from .auth import get_current_user
from datetime import datetime

router = APIRouter(prefix="/feed", tags=["Feed"])

@router.post("/", response_model=FeedPostResponse)
async def create_post(
    post_data: FeedPostCreate, 
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    new_post = FeedPost(
        user_id=current_user.id,
        content=post_data.content,
        media_url=post_data.media_url,
        media_type=post_data.media_type,
        event_id=post_data.event_id,
        location=post_data.location,
        feeling=post_data.feeling,
        tagged_users=str(post_data.tagged_users) if post_data.tagged_users else None,
        created_at=datetime.utcnow().isoformat()
    )
    db.add(new_post)
    await db.commit()
    await db.refresh(new_post)
    
    # Construct response manually since we just created it
    return await get_post_response(new_post, current_user, db)

@router.get("/", response_model=list[FeedPostResponse])
async def get_feed(
    skip: int = 0, 
    limit: int = 20, 
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    # Fetch posts ordered by creation date
    result = await db.execute(
        select(FeedPost)
        .order_by(desc(FeedPost.created_at))
        .offset(skip)
        .limit(limit)
    )
    posts = result.scalars().all()
    
    response_posts = []
    for post in posts:
        response_posts.append(await get_post_response(post, current_user, db))
        
    return response_posts

@router.post("/{post_id}/like")
async def toggle_like(
    post_id: int, 
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    # Check if post exists
    result = await db.execute(select(FeedPost).where(FeedPost.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Check if already liked
    result = await db.execute(select(FeedLike).where(
        FeedLike.post_id == post_id,
        FeedLike.user_id == current_user.id
    ))
    existing_like = result.scalar_one_or_none()

    if existing_like:
        # Unlike
        await db.delete(existing_like)
        liked = False
    else:
        # Like
        new_like = FeedLike(
            post_id=post_id,
            user_id=current_user.id,
            created_at=datetime.utcnow().isoformat()
        )
        db.add(new_like)
        liked = True
    
    await db.commit()
    return {"liked": liked}

@router.post("/{post_id}/comment", response_model=FeedCommentResponse)
async def add_comment(
    post_id: int, 
    comment_data: FeedCommentCreate,
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    # Check if post exists
    result = await db.execute(select(FeedPost).where(FeedPost.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    new_comment = FeedComment(
        post_id=post_id,
        user_id=current_user.id,
        content=comment_data.content,
        created_at=datetime.utcnow().isoformat()
    )
    db.add(new_comment)
    await db.commit()
    await db.refresh(new_comment)

    # Get user name for response
    user_name = await get_user_name(current_user, db)
    
    return FeedCommentResponse(
        id=new_comment.id,
        user_id=new_comment.user_id,
        content=new_comment.content,
        created_at=new_comment.created_at,
        user_name=user_name
    )

# Helper functions
async def get_user_name(user: User, db: AsyncSession) -> str:
    if user.role == UserRole.STUDENT:
        result = await db.execute(select(Student).where(Student.user_id == user.id))
        profile = result.scalar_one_or_none()
        return profile.name if profile else "Student"
    elif user.role == UserRole.ORGANIZER:
        result = await db.execute(select(Organizer).where(Organizer.user_id == user.id))
        profile = result.scalar_one_or_none()
        return profile.organization_name if profile else "Organizer"
    return "Admin"

async def get_post_response(post: FeedPost, current_user: User, db: AsyncSession) -> FeedPostResponse:
    # Get author details
    result = await db.execute(select(User).where(User.id == post.user_id))
    author = result.scalar_one_or_none()
    author_name = await get_user_name(author, db)
    
    # Get event details if tagged
    event_title = None
    if post.event_id:
        result = await db.execute(select(Event).where(Event.id == post.event_id))
        event = result.scalar_one_or_none()
        if event:
            event_title = event.title

    # Get likes count
    result = await db.execute(select(func.count(FeedLike.id)).where(FeedLike.post_id == post.id))
    likes_count = result.scalar()
    
    # Check if current user liked
    result = await db.execute(select(FeedLike).where(
        FeedLike.post_id == post.id,
        FeedLike.user_id == current_user.id
    ))
    is_liked = result.scalar_one_or_none() is not None
    
    # Get comments
    result = await db.execute(select(FeedComment).where(FeedComment.post_id == post.id).order_by(FeedComment.created_at))
    comments = result.scalars().all()
    
    comment_responses = []
    for comment in comments:
        # Get comment author
        result = await db.execute(select(User).where(User.id == comment.user_id))
        comment_author = result.scalar_one_or_none()
        comment_author_name = await get_user_name(comment_author, db)
        
        comment_responses.append(FeedCommentResponse(
            id=comment.id,
            user_id=comment.user_id,
            content=comment.content,
            created_at=comment.created_at,
            user_name=comment_author_name
        ))

    return FeedPostResponse(
        id=post.id,
        user_id=post.user_id,
        content=post.content,
        media_url=post.media_url,
        media_type=post.media_type,
        event_id=post.event_id,
        location=post.location,
        feeling=post.feeling,
        tagged_users=post.tagged_users,
        created_at=post.created_at,
        user_name=author_name,
        user_role=author.role,
        event_title=event_title,
        likes_count=likes_count,
        comments_count=len(comments),
        is_liked=is_liked,
        comments=comment_responses
    )
