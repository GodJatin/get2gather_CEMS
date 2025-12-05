import sqlite3
import os

db_path = r"d:\Desktop\Pro Test\test.db"

if not os.path.exists(db_path):
    print(f"ERROR: Database not found at {db_path}")
    exit(1)

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print("--- USERS ---")
    cursor.execute("SELECT email, role FROM users")
    users = cursor.fetchall()
    for u in users:
        print(u)
    
    print("\n--- INVITES ---")
    try:
        cursor.execute("SELECT email, invite_code, is_used FROM organizer_invites")
        invites = cursor.fetchall()
        for i in invites:
            print(i)
    except Exception as e:
        print(f"Error reading invites: {e}")

    conn.close()

except Exception as e:
    print(f"Database error: {e}")
