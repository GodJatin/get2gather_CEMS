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

@router.get("", response_model=List[schemas.FeedPostResponse])
async def get_feed(limit: int = 50, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from models import Student, Organizer, Event
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
    
    # Helper to resolve tags
    def resolve_tags(user_ids, event_ids):
        resolved_users = []
        if user_ids:
            # Optimize: batch fetch? For now simple loop or in_ check
            # User names can be complex (Student vs Organizer).
            # For simplicity let's rely on User table if name needed, or join. 
            # Actually easier: fetch User, then resolve name.
            users = db.execute(select(User).where(User.id.in_(user_ids))).scalars().all()
            for u in users:
                name = "User"
                if u.role == UserRole.STUDENT:
                     s = db.execute(select(Student).where(Student.user_id == u.id)).scalar_one_or_none()
                     if s: name = s.name
                elif u.role == UserRole.ORGANIZER:
                     o = db.execute(select(Organizer).where(Organizer.user_id == u.id)).scalar_one_or_none()
                     if o: name = o.organization_name
                resolved_users.append({"id": u.id, "name": name})

        resolved_events = []
        if event_ids:
            events = db.execute(select(Event).where(Event.id.in_(event_ids))).scalars().all()
            for e in events:
                resolved_events.append({"id": e.id, "name": e.title})
        
        return resolved_users, resolved_events

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

        # Get recent comments - increased limit to support threading
        comments_query = (
            select(FeedComment, User, Student)
            .join(User, FeedComment.user_id == User.id)
            .outerjoin(Student, User.id == Student.user_id)
            .where(FeedComment.post_id == post.id)
            .order_by(desc(FeedComment.created_at))
            .limit(100) 
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
                created_at=comment.created_at,
                parent_id=comment.parent_id
            ))
        
        # Resolve Tags
        t_users, t_events = resolve_tags(post.tagged_users or [], post.tagged_events or [])

        # Get Active Effect
        active_effect = None
        if student and student.active_effect:
            active_effect = student.active_effect

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
            comments=comments_list,
            # Populate missing fields
            media_type=post.media_type,
            event_id=post.event_id,
            location=post.location,
            feeling=post.feeling,
            tagged_users=t_users,
            tagged_events=t_events,
            user_active_effect=active_effect
        ))
        
    return posts_data

@router.post("", response_model=schemas.FeedPostResponse)
async def create_post(
    post_data: schemas.FeedPostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        print(f"DEBUG: create_post called. Content: {post_data.content}")
        
        # 1. Create Post
        timestamp = datetime.utcnow().isoformat()
        new_post = FeedPost(
            user_id=current_user.id,
            content=post_data.content,
            created_at=timestamp,
            media_urls=post_data.media_urls,
            media_type='image' if post_data.media_urls else 'text',
            event_id=post_data.event_id,
            location=post_data.location,
            feeling=post_data.feeling,
            tagged_users=post_data.tagged_users,
            tagged_events=post_data.tagged_events
        )
        db.add(new_post)
        db.commit()
        db.refresh(new_post)
        
        print(f"DEBUG: Post created. ID: {new_post.id}, Time: {new_post.created_at}")

        # 2. Fetch Name (Robust Method)
        from models import Student, Organizer, Event
        user_name = "User"
        
        # Check Student
        student = db.execute(select(Student).where(Student.user_id == current_user.id)).scalar_one_or_none()
        if student:
            user_name = student.name
            print(f"DEBUG: Found Student profile. Name: {user_name}")
        else:
            # Check Organizer
            organizer = db.execute(select(Organizer).where(Organizer.user_id == current_user.id)).scalar_one_or_none()
            if organizer:
                user_name = organizer.organization_name
                print(f"DEBUG: Found Organizer profile. Name: {user_name}")
            else:
                print("DEBUG: No profile found for user.")
        
        # Helper to resolve tags (duplicate of get_feed logic, should be refactored but inline for now)
        def resolve_tags(user_ids, event_ids):
            resolved_users = []
            if user_ids:
                users = db.execute(select(User).where(User.id.in_(user_ids))).scalars().all()
                for u in users:
                    name = "User"
                    if u.role == UserRole.STUDENT:
                         s = db.execute(select(Student).where(Student.user_id == u.id)).scalar_one_or_none()
                         if s: name = s.name
                    elif u.role == UserRole.ORGANIZER:
                         o = db.execute(select(Organizer).where(Organizer.user_id == u.id)).scalar_one_or_none()
                         if o: name = o.organization_name
                    resolved_users.append({"id": u.id, "name": name})

            resolved_events = []
            if event_ids:
                events = db.execute(select(Event).where(Event.id.in_(event_ids))).scalars().all()
                for e in events:
                    resolved_events.append({"id": e.id, "name": e.title})
            
            return resolved_users, resolved_events
            
        t_users, t_events = resolve_tags(new_post.tagged_users or [], new_post.tagged_events or [])

        # 3. Construct Response
        return schemas.FeedPostResponse(
            id=new_post.id,
            content=new_post.content or "", 
            user_id=current_user.id,
            user_name=str(user_name), 
            created_at=str(new_post.created_at or timestamp), # Fallback to initial timestamp
            media_urls=new_post.media_urls or [],
            likes_count=0,
            comments_count=0,
            is_liked=False,
            comments=[],
            # Missing fields required by Pydantic:
            media_type=new_post.media_type,
            event_id=new_post.event_id,
            location=new_post.location,
            feeling=new_post.feeling,
            tagged_users=t_users,
            tagged_events=t_events
        )
    except Exception as e:
        print(f"CREATE POST ERROR: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to create post: {str(e)}")

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
        created_at=datetime.utcnow().isoformat(),
        parent_id=comment_data.parent_id
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
        created_at=new_comment.created_at,
        parent_id=new_comment.parent_id
    )

@router.get("/taggable/events")
async def get_taggable_events(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from models import Booking, Volunteer, Event
    
    booked_ids = []
    # Bookings are linked to Student, not User directly
    if current_user.student_profile:
        booked_ids = db.execute(select(Booking.event_id).where(Booking.student_id == current_user.student_profile.id)).scalars().all()
    
    # Volunteers are linked to User directly
    volunteered_ids = db.execute(select(Volunteer.event_id).where(Volunteer.user_id == current_user.id)).scalars().all()
    
    all_ids = set(booked_ids + volunteered_ids)
    
    if not all_ids:
        return []
        
    events = db.execute(select(Event).where(Event.id.in_(all_ids))).scalars().all()
    return [{"id": e.id, "title": e.title} for e in events]

@router.get("/taggable/users")
async def get_taggable_users(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from models import user_follows, Student, Organizer
    # Users the current user follows
    
    # helper to get name 
    def get_name(u):
        if u.role == UserRole.STUDENT:
            s = db.execute(select(Student).where(Student.user_id == u.id)).scalar_one_or_none()
            return s.name if s else "User"
        elif u.role == UserRole.ORGANIZER:
            o = db.execute(select(Organizer).where(Organizer.user_id == u.id)).scalar_one_or_none()
            return o.organization_name if o else "Organizer"
        return "User"

    # Get followed User IDs
    # user_follows table: follower_id, followed_id
    stmt = select(User).join(user_follows, user_follows.c.followed_id == User.id).where(user_follows.c.follower_id == current_user.id)
    followed_users = db.execute(stmt).scalars().all()
    
    return [{"id": u.id, "name": get_name(u)} for u in followed_users]
