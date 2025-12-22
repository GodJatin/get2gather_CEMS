# Get2Gather - Campus Event Management System

**Get2Gather** is a comprehensive campus event management platform designed to bridge the gap between students and event organizers. It streamlines event discovery, registration, and management, fostering a vibrant campus community.

## 🚀 Features

### For Students
*   **Social Feed**: Real-time social feed to see what's happening, share moments, and tag friends.
*   **Event Booking**: Seamless booking with QR Code tickets delivered via Email.
*   **Waitlist System**: Automatic waitlist handling. If a spot opens up (via cancellation), you get promoted automatically!
*   **Gamification**: Earn points for attending events and volunteering. Climb the Leaderboard!
*   **Inventory**: Collect badges and profile effects.

### For Organizers
*   **Dashboard**: Real-time analytics on ticket sales, attendance, and volunteer engagement.
*   **Event Management**: Create rich event pages with images, schedules, and capacity limits.
*   **Smart Attendance**: Built-in QR Code Scanner (Camera & Manual) to verify tickets instantly.
*   **Feedback Loop**: One-click "Request Feedback" to survey attendees after an event properly.
*   **Profile Management**: Update organization details easily.

## 🛠️ Tech Stack

**Frontend**:
*   **Framework**: Next.js 14 (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS, Framer Motion
*   **Components**: Recharts (Analytics), Lucide Icons

**Backend**:
*   **Framework**: FastAPI (Python)
*   **Database**: PostgreSQL (Supabase)
*   **ORM**: SQLAlchemy
*   **Email**: SMTP (Gmail) for OTPs, Tickets, and Notifications.

## 🏃‍♂️ How to Run

### Prerequisites
*   Node.js (v18+)
*   Python (v3.9+)
*   PostgreSQL Database (Supabase recommended)

### 1. Backend Setup
The backend is located in `frontend/backend`.

```bash
cd frontend/backend
# Create virtual environment
python -m venv venv
# Activate (Windows)
venv\Scripts\activate
# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with:
# DATABASE_URL=...
# SECRET_KEY=...
# SMTP_EMAIL=...
# SMTP_PASSWORD=...

# Run Server
uvicorn main:app --reload
```
*Backend runs on `http://localhost:8000`*

### 2. Frontend Setup
The frontend is in the `frontend` directory.

```bash
cd frontend
# Install dependencies
npm install

# Run Development Server
npm run dev
```
*Frontend runs on `http://localhost:3000`*

## 📱 Troubleshooting
*   **Email Issues**: Check your `SMTP_PASSWORD`. If using Gmail, ensure it's an App Password, not your login password.
*   **Database Connection**: Ensure your IP is allowed in Supabase/Postgres settings.
*   **Login Errors**: Check the Backend Console for debug logs.

## 👥 Contributors
*   **GodJatin** - Lead Developer
*   **Antigravity** - AI Assistant (Google DeepMind)
