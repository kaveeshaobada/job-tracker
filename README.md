# JobTrack

A full-stack job application tracker built to manage the reality of modern job hunting — dozens of applications, scattered notes, missed follow-ups, and no visibility into how the search is actually going.

**[Live Demo](#)** · Built by [Kaveesha Obadakumbura](#)

---

## Why I built this

In today's job market, applying to a handful of companies isn't enough — you're often applying to 50, 100, or more. Tracking the status of each one, remembering who you spoke to, and knowing when to follow up quickly becomes overwhelming with a spreadsheet or sticky notes. JobTrack started as a personal tool to manage my own internship search, and turned into a full-featured application anyone can use to track theirs.

---

## Features

### Applications
- Full CRUD with company, role, status, job posting link, and follow-up reminders
- Three views: **List**, **Kanban** (drag-and-drop between stages), and **Analytics** (charts, response/offer rate, weekly trend)
- Tags for categorization (e.g. Referral, Remote, Dream company)
- Timestamped notes timeline per application — like a lightweight CRM log
- File attachments (resumes, cover letters) via Cloudinary
- Company logos auto-fetched
- CSV export
- Global search / command palette (`⌘K`)

### Contacts
- Track recruiters, referrals, and networking contacts
- Link a contact directly to the application they're associated with (bidirectional navigation)

### Calendar
- Two views of the same data: a grouped list (Overdue / Today / This Week / Later) and a full month grid

### Settings
- Editable profile: name, target role, weekly application goal
- Profile picture upload with crop/zoom, HEIC support, and automatic compression
- Weekly goal progress bar on the dashboard

### Notifications & Onboarding
- Reminder notifications 7 days and 1 day before a follow-up date
- First-time user tour walking through the main features

### Auth & Account
- Email/password signup and login
- Google Sign-In
- Dark/light theme toggle

---

## Tech Stack

**Frontend**
- React (Vite)
- Tailwind CSS v4 (custom design tokens)
- React Router
- Axios
- Framer Motion
- @dnd-kit (drag-and-drop)
- Recharts (analytics charts)
- cmdk (command palette)
- @react-oauth/google
- react-easy-crop, heic2any (avatar upload pipeline)
- react-hot-toast, lucide-react, date-fns

**Backend**
- Node.js / Express 5
- PostgreSQL (hosted on Neon)
- Prisma ORM (v7, driver adapters)
- JWT authentication (bcryptjs)
- Zod (validation)
- Helmet, express-rate-limit (security)
- Pino / pino-http (structured logging)
- Cloudinary (file & image storage)
- google-auth-library (Google OAuth verification)

**Testing**
- Jest + Supertest — 34 tests covering auth, CRUD, and cross-user ownership boundaries

**Deployment**
- Backend: [Render](https://render.com)
- Frontend: [Vercel](https://vercel.com)
- Database: [Neon](https://neon.tech) (serverless Postgres)

---

## Project Structure
job-tracker/
├── backend/
│ ├── prisma/
│ │ ├── schema.prisma
│ │ └── migrations/
│ ├── src/
│ │ ├── app.js # Express app (exported for testing)
│ │ ├── index.js # Server entry point
│ │ ├── routes/
│ │ ├── middleware/
│ │ ├── validators/
│ │ └── tests/
│ └── package.json
└── frontend/
├── src/
│ ├── pages/
│ ├── components/
│ ├── context/
│ └── api/
└── package.json


---

## Getting Started Locally

### Prerequisites
- Node.js 18+
- A PostgreSQL database (e.g. a free [Neon](https://neon.tech) project)
- A [Cloudinary](https://cloudinary.com) account (free tier)
- A [Google Cloud](https://console.cloud.google.com) OAuth Client ID

### 1. Clone the repo
```bash
git clone https://github.com/<your-username>/job-tracker.git
cd job-tracker
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
JWT_SECRET="a-long-random-secret"
PORT=5001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
```

Run migrations and start the server:
```bash
npx prisma migrate dev
npm run dev
```

### 3. Frontend setup
```bash
cd ../frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL="http://localhost:5001/api"
VITE_GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
```

Start the dev server:
```bash
npm run dev
```

The app will be running at `http://localhost:5173`.

### 4. Running tests
```bash
cd backend
npm test
```
Tests run against a separate database — create `backend/.env.test` with its own `DATABASE_URL` before running.

---

## Deployment

- **Backend (Render):** root directory `backend`, build command `npm install && npm run build` (runs `prisma generate` + `prisma migrate deploy`), start command `npm start`.
- **Frontend (Vercel):** root directory `frontend`, framework preset Vite, set the environment variables listed above.
- Remember to update `FRONTEND_URL` on the backend and the authorized JavaScript origin in Google Cloud Console once you have your production frontend URL.

---

## License

This project is open for anyone to explore, learn from, or build on.

