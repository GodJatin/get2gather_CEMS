from sqlalchemy.future import select
from sqlalchemy import func
from models import Student, Booking, FeedPost, Volunteer

POINTS_PER_BOOKING = 100
POINTS_PER_POST = 50
POINTS_PER_VOLUNTEER = 200

def calculate_student_points(db, student_id: int, user_id: int):
    """
    Calculate total, spent, and available points for a student.
    Returns a dictionary with all point-related stats.
    """
    
    # 1. Fetch Student Data (spent_points)
    # Avoid fetching full object to prevent MissingGreenlet on lazy loads
    result = db.execute(select(Student.spent_points).where(Student.id == student_id))
    spent_points = result.scalar_one_or_none() or 0
    
    # 2. Count ATTENDED Bookings only (100 points each)
    b_res = db.execute(select(func.count()).select_from(Booking).where(
        Booking.student_id == student_id,
        Booking.attended == True
    ))
    bookings_count = b_res.scalar() or 0
    
    # 3. Count Posts (50 points each)
    p_res = db.execute(select(func.count()).select_from(FeedPost).where(FeedPost.user_id == user_id))
    posts_count = p_res.scalar() or 0
    
    # 4. Count ATTENDED Volunteer Activities only (200 points each)
    v_res = db.execute(select(func.count()).select_from(Volunteer).where(
        Volunteer.user_id == user_id, 
        Volunteer.status == "Approved",
        Volunteer.attended == True
    ))
    volunteer_count = v_res.scalar() or 0
    
    # Calculate Totals
    total_points = (bookings_count * POINTS_PER_BOOKING) + (posts_count * POINTS_PER_POST) + (volunteer_count * POINTS_PER_VOLUNTEER)
    available_points = total_points - spent_points
    
    return {
        "total_points": total_points,
        "spent_points": spent_points,
        "available_points": available_points,
        "bookings_count": bookings_count,
        "posts_count": posts_count,
        "volunteer_count": volunteer_count
    }

def calculate_gamification(student, points_data):
    """
    Calculate dynamic title and badges based on points and activity.
    Student can be an object or dict-like.
    """
    score = points_data["available_points"]
    bookings_count = points_data["bookings_count"]
    volunteer_count = points_data["volunteer_count"]
    
    # Safely access attributes
    title = getattr(student, "title", None)
    badges = getattr(student, "badges", [])
    
    # Ensure badges is a list (handle None or other types)
    if not isinstance(badges, list):
        badges = []
    
    if not title:
        if score > 1000:
            title = "Campus Legend"
        elif bookings_count > 5:
            title = "Event Enthusiast"
        elif volunteer_count > 2:
            title = "Helping Hand"
        else:
            title = "Rising Star"
            
    # Avoid duplicates
    # badges is list of dicts: [{"name": "Bronze", "icon": ...}, ...]
    try:
        existing_badges = set()
        clean_badges = []
        for b in badges:
            if isinstance(b, dict):
                name = b.get('name')
                if name:
                    existing_badges.add(name)
                    clean_badges.append(b)
            elif isinstance(b, str):
                # Handle legacy string badges
                existing_badges.add(b)
                clean_badges.append({"name": b, "icon": "🏅"}) # Default icon
        
        badges = clean_badges
    except Exception:
        existing_badges = set()
        badges = [] # Reset if corrupt
    
    if score >= 500 and "Bronze" not in existing_badges:
        badges.append({"name": "Bronze", "icon": "🥉"})
    if score >= 1000 and "Silver" not in existing_badges:
        badges.append({"name": "Silver", "icon": "🥈"})
    if volunteer_count >= 1 and "Volunteer" not in existing_badges:
        badges.append({"name": "Volunteer", "icon": "🤝"})
        
    return {
        "title": title,
        "badges": badges
    }
