import sqlite3
import bcrypt

db_path = r"d:\Desktop\Pro Test\test.db"

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # 1. Insert/Update Admin User
    admin_email = "admin@get2gather.com"
    # Hash password "admin123" using bcrypt (standard format for passlib)
    # Using a known hash for "admin123" to avoid dependency issues if bcrypt lib matches differently
    # But passlib uses standard bcrypt headers. Let's try inserting a hash generated here.
    # $2b$12$ is standard.
    password = b"admin123"
    hashed = bcrypt.hashpw(password, bcrypt.gensalt()).decode('utf-8')
    
    print(f"Checking Admin: {admin_email}")
    cursor.execute("SELECT id FROM users WHERE email = ?", (admin_email,))
    existing = cursor.fetchone()
    
    if not existing:
        print("Inserting Admin User...")
        cursor.execute("""
            INSERT INTO users (email, hashed_password, full_name, role, is_active)
            VALUES (?, ?, ?, ?, ?)
        """, (admin_email, hashed, "System Admin", "admin", 1))
    else:
        print("Admin user already exists.")

    # 2. Insert/Update Invite Code
    invite_email = "224jatin2006@gmail.com"
    code = "ABCD1234"
    
    print(f"Checking Invite: {invite_email}")
    cursor.execute("SELECT id FROM organizer_invites WHERE email = ?", (invite_email,))
    existing_invite = cursor.fetchone()
    
    if not existing_invite:
        print("Inserting Invite Code...")
        cursor.execute("""
            INSERT INTO organizer_invites (email, invite_code, is_used)
            VALUES (?, ?, ?)
        """, (invite_email, code, 0))
    else:
        print("Invite code already exists.")

    conn.commit()
    print("Database fix committed.")
    conn.close()

except Exception as e:
    print(f"Error fixing DB: {e}")
