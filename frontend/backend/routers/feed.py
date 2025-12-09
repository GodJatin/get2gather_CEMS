from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select, desc, func
from database import get_db
from models import FeedPost, User, FeedLike, FeedComment, UserRole
from routers.auth import get_current_user
from typing import List
from datetime import datetime
import schemas

router = APIRouter(prefix="/feed", tags=["feed"])

@router.get("/", response_model=List[schemas.FeedPostResponse])
async def get_feed(limit: int = 50, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from models import Student, Organizer
    # Fetch posts with user info, and join Student/Organizer to get names
    posts_query = (
        select(FeedPost, User, Student, Organizer)
        .join(User, FeedPost.user_id == User.id)
        .outerjoin(Student, User.id == Student.user_id)
        .outerjoin(Organizer, User.id == Organizer.user_id)
        .order_by(desc(FeedPost.created_at))
        .limit(limit)
    )
    results = db.execute(posts_query).all()
    
    posts_data = []
    seen_ids = set()
    for post, user, student, organizer in results:
        if post.id in seen_ids:
            continue
        seen_ids.add(post.id)
        
        # Determine Name
        user_name = "User"
        if student: user_name = student.name
        elif organizer: user_name = organizer.organization_name
        
        # Get Likes Count
        likes_count = db.scalar(
            select(func.count()).select_from(FeedLike).where(FeedLike.post_id == post.id)
        )
        
        # Get Comments Count
        comments_count = db.scalar(
            select(func.count()).select_from(FeedComment).where(FeedComment.post_id == post.id)
        )
        
        # Check if liked by current user
        is_liked = db.scalar(
            select(func.count()).select_from(FeedLike).where(
                (FeedLike.post_id == post.id) & (FeedLike.user_id == current_user.id)
            )
        ) > 0

        # Get recent comments
        comments_query = (
            select(FeedComment, User, Student)
            .join(User, FeedComment.user_id == User.id)
            .outerjoin(Student, User.id == Student.user_id)
            .where(FeedComment.post_id == post.id)
            .order_by(desc(FeedComment.created_at))
            .limit(3)
        )
        comments_res = db.execute(comments_query).all()
        comments_list = []
        c_seen_ids = set()
        for comment, c_user, c_student in comments_res:
            if comment.id in c_seen_ids:
                continue
            c_seen_ids.add(comment.id)

            c_name = c_student.name if c_student else "User"
            comments_list.append(schemas.FeedCommentResponse(
                id=comment.id,
                user_id=c_user.id,
                user_name=c_name,
                content=comment.content,
                created_at=comment.created_at
            ))

        posts_data.append(schemas.FeedPostResponse(
            id=post.id,
            content=post.content or "",
            user_id=user.id,
            user_name=user_name,
            created_at=post.created_at,
            media_urls=post.media_urls or [],
            likes_count=likes_count or 0,
            comments_count=comments_count or 0,
            is_liked=is_liked,
            comments=comments_list
        ))
        
    return posts_data

@router.post("/", response_model=schemas.FeedPostResponse)
async def create_post(
    post_data: schemas.FeedPostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        new_post = FeedPost(
            user_id=current_user.id,
            content=post_data.content,
            created_at=datetime.utcnow().isoformat(),
            media_urls=post_data.media_urls,
            media_type='image' if post_data.media_urls else 'text'
        )
        db.add(new_post)
        db.commit()
        db.refresh(new_post)
        
        # Fetch Name
        from models import Student, Organizer
        user_name = "Me"
        if current_user.role == UserRole.STUDENT:
            student = db.execute(select(Student).where(Student.user_id == current_user.id)).scalar_one_or_none()
            if student: user_name = student.name
        elif current_user.role == UserRole.ORGANIZER:
            organizer = db.execute(select(Organizer).where(Organizer.user_id == current_user.id)).scalar_one_or_none()
            if organizer: user_name = organizer.organization_name

        return schemas.FeedPostResponse(
            id=new_post.id,
            content=new_post.content,
            user_id=current_user.id,
            user_name=user_name,
            created_at=new_post.created_at,
            media_urls=new_post.media_urls or [],
            likes_count=0,
            comments_count=0,
            is_liked=False,
            comments=[]
        )
    except Exception as e:
        print(f"CREATE POST ERROR: {e}")
        raise HTTPException(status_code=500, detail="Failed to create post")

@router.post("/{post_id}/like")
async def toggle_like(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if exists
    existing = db.execute(
        select(FeedLike).where(
            (FeedLike.post_id == post_id) & (FeedLike.user_id == current_user.id)
        )
    ).scalar_one_or_none()

    if existing:
        db.delete(existing)
        db.commit()
        return {"status": "unliked"}
    else:
        new_like = FeedLike(
            post_id=post_id,
            user_id=current_user.id,
            created_at=datetime.utcnow().isoformat()
        )
        db.add(new_like)
        db.commit()
        return {"status": "liked"}

@router.post("/{post_id}/comment", response_model=schemas.FeedCommentResponse)
async def add_comment(
    post_id: int,
    comment_data: schemas.FeedCommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_comment = FeedComment(
        post_id=post_id,
        user_id=current_user.id,
        content=comment_data.content,
        created_at=datetime.utcnow().isoformat()
    )
    db.add(new_comment)
    db.commit()
    
    # Fetch Name for response
    from models import Student, Organizer
    user_name = "User"
    if current_user.role == UserRole.STUDENT:
        student = db.execute(select(Student).where(Student.user_id == current_user.id)).scalar_one_or_none()
        if student: user_name = student.name
    elif current_user.role == UserRole.ORGANIZER:
        organizer = db.execute(select(Organizer).where(Organizer.user_id == current_user.id)).scalar_one_or_none()
        if organizer: user_name = organizer.organization_name

    return schemas.FeedCommentResponse(
        id=new_comment.id,
        user_id=current_user.id,
        user_name=user_name,
        content=new_comment.content,
        created_at=new_comment.created_at
    )
