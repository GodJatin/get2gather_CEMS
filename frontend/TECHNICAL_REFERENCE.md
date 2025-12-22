# Get2Gather - Technical Reference & Documentation

## 1. Project Overview
Get2Gather is a campus event management system enabling:
- **Organizers** (Departments, Clubs) to create/manage events, track attendance via QR codes, and verify volunteers.
- **Students** to discover events, book tickets, earn points (gamification), and socialize via a feed.

**Tech Stack**:
- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Framer Motion.
- **Backend**: FastAPI (Python), PostgreSQL (via Supabase), SQLAlchemy ORM.
- **Auth**: JWT (OAuth2 Password Bearer) with Role-Based Access Control (RBAC).

## 2. Directory Structure

### `frontend/` (Root)
Contains the Next.js application.
- `app/`: Next.js App Router pages.
  - `(auth)/`: Login/Signup pages.
  - `admin/`: Admin dashboard (if enabled).
  - `events/`: Public event details code.
  - `organizer/`: Organizer dashboard, event creation, scan tools.
  - `student/`: Student dashboard, feed, profile, bookings.
- `components/`: Reusable React components (`EventCard`, `Navbar`, `EngagementChart`, etc.).
- `lib/`: Utilities (`api.ts` for Axios, `dateUtils.ts`).
- `backend/`: The Python API server (hosted in the same repo).

### `frontend/backend/`
Contains the FastAPI server.
- `main.py`: Entry point. Configures Middleware (CORS, RateLimit) and includes routers.
- `database.py`: DB connection setup using SQLAlchemy.
- `models.py`: Database Schema definitions (`User`, `Student`, `Organizer`, `Event`, `Booking`, etc.).
- `schemas.py`: Pydantic models for Request/Response validation.
- `email_service.py`: Handles all email logic (OTP, Ticket, Reminders) using SMTP.
- `routers/`: API route modules.

## 3. Backend Modules (Detailed)

### Core
- **`main.py`**:
  - Initializes FastAPI app.
  - Sets up CORS for frontend communication.
  - Mounts static files (if any).
  - Includes all routers from `routers/`.
  
- **`database.py`**:
  - `get_db()`: Dependency that yields a database session.
  - Handles Engine creation using `DATABASE_URL`.

- **`models.py`**:
  - **User**: Base user with `email`, `hashed_password`, `role`.
  - **Student**: Extends User. Contains `enrollment_number`, `badges`, `points`.
  - **Organizer**: Extends User. Contains `organization_name`.
  - **Event**: Core entity. `title`, `date`, `capacity`, `seats_available`.
  - **Booking**: Link between Student and Event. Contains `qr_code`, `status`.
  - **Volunteer**: Link between User and Event for volunteering.
  - **FeedPost/Comment/Like**: Social features.

- **`email_service.py`**:
  - `send_email()`: Generic SMTP sender.
  - `send_otp_email()`: Sends verification codes.
  - `send_booking_ticket()`: Generates QR Code/ICS and sends HTML ticket.
  - `send_feedback_request_email()`: Sends post-event feedback links.

### Routers (`backend/routers/`)
- **`auth.py`**:
  - `POST /auth/token`: Login (returns JWT).
  - `POST /auth/student/initiate`: Start signup (sends OTP).
  - `POST /auth/student/verify`: Check OTP.
  - `POST /auth/student/complete`: Finalize profile.
  - `PUT /auth/organizer/profile`: Update organizer details.

- **`events.py`**:
  - `POST /events`: Create event (Organizer only). Broadcasts notification.
  - `GET /events`: List public events.
  - `POST /events/checkin`: **Critical**. Scans QR code, marks attendance, awards points.
  - `POST /events/{id}/request-feedback`: Triggers feedback emails to attendees.
  - `POST /events/{id}/waitlist`: Manages waitlist joins.

- **`bookings.py`**:
  - `POST /bookings`: Book a ticket. Generates QR and updates seat count.
  - `DELETE /bookings/{id}`: Cancel booking. Auto-promotes waitlisted users.
  - `GET /bookings/my`: List student's bookings.

- **`volunteers.py`**:
  - Manage volunteer applications and approvals.
  - `POST /volunteers/apply`.

- **`feed.py`**:
  - Social feed logic. `GET /feed` (posts), `POST /feed` (create post).

- **`media.py`**:
  - Handles image uploads (to Supabase Storage).

- **`stats.py`**:
  - Admin/Organizer analytics.

## 4. Frontend Features (Detailed)

### Student Portal
- **Feed (`app/student/feed`)**: Instagram-like feed for campus updates.
- **Events (`app/student/events`)**: Grid view of events with filtering.
- **Bookings (`app/student/bookings`)**:
  - View "Upcoming" (with QR Ticket) and "History".
  - **Cancel Booking**: Releases seat and triggers waitlist promotion.
- **Profile (`app/student/profile`)**:
  - View badges, points, and rank.
  - Edit basic info.

### Organizer Portal
- **Dashboard (`app/organizer/dashboard`)**:
  - **EngagementChart**: Visualizes ticket sales vs. attendance.
  - Quick stats (Total Events, Attendees).
- **Events Management (`app/organizer/events`)**:
  - **Edit Profile**: Organizers can now update their details.
  - Create/Edit events.
  - **Request Feedback**: Button to email all attendees of completed events.
- **Scanner (`app/organizer/scan`)**:
  - Uses Device Camera or Manual Entry.
  - Validates QR tokens against `backend/routers/events.py`.

### Shared Components
- **`EngagementChart.tsx`**: Reusable SVG/Recharts component for analytics.
- **`Navbar.tsx`**: Dynamic navigation based on user role.

## 5. Key Workflows explained

### Booking & Cancellation with Waitlist
1. **Booking**: Student books event -> `seats_available` decreases.
2. **Full Event**: If `seats_available == 0`, User joins **Waitlist**.
3. **Cancellation**:
   - Student cancels booking.
   - System checks Waitlist.
   - If Waitlist > 0:
     - First waiter is removed from waitlist.
     - New Booking created for waiter.
     - Email sent to waiter ("You've been promoted!").
     - `seats_available` remains same (Swapped).
   - If Waitlist == 0:
     - `seats_available` increases.

### Attendance System
1. **Ticket Generation**: When booked, a unique string `booking:{id}:{token}` is generated.
2. **Email**: QR code image representing this string is emailed.
3. **Scanning**: Organizer uses **Scanner** page.
4. **Validation**: Backend checks if `booking_id` matches and `token` is valid.
5. **Reward**: If valid, `attended=True` and Points are added to Student account.

## 6. Deployment
- **Vercel**: Hosts the Frontend (and potentially Backend via Serverless functions if configured in `api/index.py`).
- **Database**: PostgreSQL (Supabase).
- **Env Variables**:
  - `DATABASE_URL`: Postgres Connection.
  - `SMTP_EMAIL` / `SMTP_PASSWORD`: For emails.
  - `SECRET_KEY`: For JWT.
