from database import SessionLocal
from models import User, Notification
from sqlalchemy import text

db = SessionLocal()

print("--- DIAGNOSTIC START ---")

try:
    # 1. Inspect Users and Roles
    print("\n[1. User Role Inspection]")
    users = db.query(User).limit(5).all()
    for u in users:
        print(f"ID: {u.id}, Email: {u.email}, Role: '{u.role}', Type: {type(u.role)}")

    # 2. Check Specific counts
    student_count_str = db.query(User).filter(User.role == 'student').count()
    student_count_enum = db.query(User).filter(User.role == 'STUDENT').count() 
    print(f"\n[2. Counts]")
    print(f"Users with role == 'student': {student_count_str}")
    print(f"Users with role == 'STUDENT': {student_count_enum}")

    # 3. Check Table Schema
    print("\n[3. Schema Inspection]")
    from sqlalchemy import inspect
    inspector = inspect(db.get_bind())
    columns = [c['name'] for c in inspector.get_columns('notifications')]
    print(f"Notification Table Columns: {columns}")
    
    if 'data' not in columns:
        print("CRITICAL: 'data' column MISSING in notifications table!")
    if 'type' not in columns:
        print("CRITICAL: 'type' column MISSING in notifications table!")

    # 4. Forensic Analysis
    print("\n[4. Forensic Analysis]")
    
    # Find Jatin
    jatin = db.query(User).filter(User.organization_name.ilike('%Jatin%')).first()
    # Or try by name in Organizer/Student profile?
    # User model has 'organization_name', Student has 'name'. 
    # User's 'name' is not in User model (it's in linked profile), but dashboard says "Jatin Shah".
    # User screenshot says "Good Evening, Jatin Shah".
    # This name comes from `/auth/me` -> returns `user.dict()` + `name` from profile.
    
    # Try finding by looking at profiles
    from models import Student, Organizer
    
    target_user = None
    target_name = "Jatin"
    
    # Try Student
    stud = db.query(Student).filter(Student.name.ilike(f'%{target_name}%')).first()
    if stud:
        print(f"Found Student: {stud.name}, UserID: {stud.user_id}")
        target_user = stud.user_id
        
    # Try Organizer
    if not target_user:
        org = db.query(Organizer).filter(Organizer.organization_name.ilike(f'%{target_name}%')).first()
        if org:
             print(f"Found Organizer: {org.organization_name}, UserID: {org.user_id}")
             target_user = org.user_id
             
    if target_user:
        print(f"Target User ID: {target_user}")
        user_notifs = db.query(Notification).filter(Notification.user_id == target_user).all()
        print(f"Notifications for Target User: {len(user_notifs)}")
        for n in user_notifs:
             print(f" - [{n.type}] {n.title}: {n.message} (Read: {n.is_read})")
    else:
        print("Could not find user 'Jatin' in DB.")
        
    # Show all unique user_ids in notifications
    unique_ids = db.query(Notification.user_id).distinct().all()
    print(f"\nUser IDs with notifications: {[u[0] for u in unique_ids]}")

except Exception as e:
    import traceback
    traceback.print_exc()
    print(f"Diagnostic Error: {e}")

finally:
    db.close()
    print("\n--- DIAGNOSTIC END ---")
