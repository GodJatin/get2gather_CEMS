import socket
import sys

TARGET = "db.vqfnndepdzdewugdcwjg.supabase.co"

print(f"Resolving: {TARGET}")

# Method 1: socket.getaddrinfo forcing IPv4
try:
    print("\n--- Method 1: socket.getaddrinfo (AF_INET) ---")
    results = socket.getaddrinfo(TARGET, 6543, family=socket.AF_INET, proto=socket.IPPROTO_TCP)
    for res in results:
        ip = res[4][0]
        print(f"✅ FOUND IPv4: {ip}")
except Exception as e:
    print(f"❌ Method 1 Failed: {e}")

# Method 2: socket.gethostbyname (usually returns IPv4)
try:
    print("\n--- Method 2: socket.gethostbyname ---")
    ip = socket.gethostbyname(TARGET)
    print(f"✅ FOUND IPv4: {ip}")
except Exception as e:
    print(f"❌ Method 2 Failed: {e}")

# Method 3: Manual DNS Query (simulated raw if needed, but let's stick to stdlib first)
# If dnspython were here it would be easier, but it's not installed reliably.
