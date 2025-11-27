import sqlite3

def check_schema():
    conn = sqlite3.connect('C:/Users/HP/.gemini/test_sync_final.db')
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(students)")
    columns = cursor.fetchall()
    print("Columns in students table:")
    found = False
    for col in columns:
        print(col)
        if col[1] == 'spent_points':
            found = True
    print(f"spent_points found: {found}")
    conn.close()

if __name__ == "__main__":
    check_schema()
