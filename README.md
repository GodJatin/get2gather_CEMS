# Get2Gather - Campus Event Management System

**Get2Gather** is a comprehensive campus event management platform designed to bridge the gap between students and event organizers. It streamlines event discovery, registration, and management, fostering a vibrant campus community.

## 🚀 Features

*   **Student Portal**:
    *   **Feed**: Real-time social feed to see what's happening, share moments, and tag friends/events.
    *   **Dashboard**: Personalized view of upcoming events, stats, and recommendations.
    *   **Events**: Browse and search for events (Workshops, Seminars, Socials).
    *   **Calendar**: Visual schedule of your registered events.
    *   **Leaderboard**: Gamified engagement with points and rankings.
    *   **Profile**: Manage your identity and viewing history.

*   **Organizer Portal**:
    *   **Dashboard**: Analytics and overview of event performance.
    *   **Create Event**: Powerful visual editor to launch events with images, ticketing (Free/Paid), and schedules.
    *   **Manage Events**: Track registrations, verify attendees with QR Scanning (simulated), and manage volunteers.
    *   **Analytics**: Insights into attendee demographics and engagement.

*   **PWA (Progressive Web App)**: Installable on mobile devices for a native-like experience.
*   **Authentication**: Secure Role-Based Access Control (RBAC) for Students, Organizers, and Admins.
*   **Security**: Rate limiting (Backend), Secure Headers, and optimized API structure.

## 🛠️ Tech Stack

**Frontend**:
*   **Framework**: Next.js 16 (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS v4, Framer Motion (Animations)
*   **Components**: Lucide React (Icons), Sonner (Toasts)
*   **State**: React Hooks

**Backend**:
*   **Framework**: FastAPI (Python)
*   **Database**: SQLite (SQLAlchemy ORM)
*   **Security**: OAuth2 with JWT, Passlib (Argon2)
*   **Rate Limiting**: Custom Middleware (Serverless Compatible)

## 🏃‍♂️ How to Run

### Prerequisites
*   Node.js (v18+)
*   Python (v3.9+)

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

## 📱 Mobile & PWA
*   The app is fully responsive.
*   **Install App**: On Android (Chrome), tap "Add to Home Screen". On iOS (Safari), tap "Share" > "Add to Home Screen".
*   *Note*: PWA installation requires HTTPS. On Vercel Preview deployments, the install prompt may be blocked by Authentication Protection. Use the Production URL for the best experience.

## 👥 Contributors
*   **GodJatin** - Lead Developer

