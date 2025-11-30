# Project File Structure & Usage

## 📂 Backend (`/backend`)
The backend is built with **FastAPI** and handles all business logic, database interactions, and authentication.

### Core Files
- **`main.py`**: The entry point of the application. Configures CORS and mounts routers.
- **`database.py`**: Database configuration using SQLAlchemy. Handles session creation.
- **`models.py`**: SQLAlchemy database models (User, Student, Organizer, Event, Booking, etc.).
### App Directory (`/frontend/app/`)
- **`(auth)/`**: Authentication pages.
    - **`login/page.tsx`**: Universal login page.
    - **`register/`**: Registration pages for Student/Organizer.
- **`student/`**: Student portal pages.
    - **`dashboard/page.tsx`**: Main student dashboard.
    - **`events/page.tsx`**: List of all events.
    - **`bookings/page.tsx`**: User's booking history and tickets.
    - **`calendar/page.tsx`**: Calendar view of events.
    - **`profile/page.tsx`**: User profile management.
- **`organizer/`**: Organizer portal pages.
    - **`dashboard/page.tsx`**: Organizer dashboard with stats.
    - **`events/`**:
        - **`page.tsx`**: List of created events (Upcoming/Completed).
        - **`create/page.tsx`**: Event creation form.
        - **`edit/[id]/page.tsx`**: Event editing form.
    - **`scan/page.tsx`**: QR Code scanner interface.
- **`events/[id]/page.tsx`**: Public event details page (accessible by all).

### Shared Components (`/frontend/components/`)
- **`Navbar.tsx`**: Responsive navigation bar (adapts to user role).
- **`MotionWrapper.tsx`**: Wrapper for Framer Motion animations.
- **`BookingSuccessModal.tsx`**: Modal shown after successful booking.
- **`TicketModal.tsx`**: Modal displaying the digital ticket.

### Configuration
- **`lib/api.ts`**: Axios instance configuration with Auth interceptors.
- **`tailwind.config.ts`**: Tailwind CSS configuration.
- **`next.config.ts`**: Next.js configuration.

---

## 🛠 Root Directory
- **`start-servers.bat`**: Windows batch script to start both Backend and Frontend servers simultaneously.
- **`requirements.txt`**: Python dependencies list.
- **`package.json`**: Node.js dependencies list.
