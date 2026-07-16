# StudyDeck

A full-stack web app for students to track assignment, project work, and midsem
exam deadlines, see incoming lectures, view expired activities, and manage
custom reminders — with email-based signup verification and password reset.

## Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth, node-cron, Nodemailer
- **Frontend:** React (Vite), React Router, Axios

## Features

- Sign up (full name, student ID, phone, course, email, password + confirm)
- Sign in with student ID + password
- Forgot password → emailed reset link that **expires after 1 hour**
- Create / edit / delete activities: assignments, project work, midsem exams, lectures
- Automatic notifications:
  - At the **start of the day** an activity is due
  - **1 hour before** the activity starts
- Expired activities view (assignments, project work, midsems)
- Create / edit / delete custom reminders

## Project structure

```
studydeck/
  backend/     Express API, MongoDB models, cron scheduler, email sending
  frontend/    React (Vite) client
```

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
- `MONGO_URI` — your MongoDB connection string (local or Atlas)
- `JWT_SECRET` — any long random string
- `RESEND_API_KEY` — from [resend.com/api-keys](https://resend.com/api-keys) (free tier available)
- `EMAIL_FROM` — must be on a domain you've verified in Resend, or use
  `onboarding@resend.dev` for quick local testing (only delivers to the email
  address on your own Resend account)
- `CLIENT_URL` — where the frontend runs (default `http://localhost:5173`)

Then start the API:

```bash
npm run dev      # with nodemon, auto-restarts on change
# or
npm start
```

The API runs on `http://localhost:5000` by default. The notification
scheduler starts automatically with the server and checks every minute for
activities that need a "starts today" or "starts in 1 hour" notification.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:5173`. If your API isn't on
`http://localhost:5000/api`, create a `.env` file in `frontend/` with:

```
VITE_API_URL=http://your-api-url/api
```

## How the notification timing works

Each activity stores a `startTime`. A cron job runs every minute and:

1. Creates a "starts today" notification once, at any point during the
   calendar day the activity begins (checked via `dayStartNotified` flag).
2. Creates a "starts in 1 hour" notification once the current time is within
   the hour before `startTime` (checked via `oneHourNotified` flag).

Both notifications are stored in the database (visible in the Notifications
page) and, if `RESEND_API_KEY` is configured, emailed to the student.

## How password reset expiry works

`forgot-password` generates a random token, hashes it, and stores the hash
with an expiry timestamp (`RESET_TOKEN_EXPIRES_MINUTES`, default 60) on the
student record. The emailed link contains the *unhashed* token. On
`reset-password`, the token is re-hashed and matched against the stored hash,
and the expiry is checked — so links older than 1 hour are rejected.

## Notes for production use

- Add rate limiting to auth routes (e.g. `express-rate-limit`)
- Add a real email-verification enforcement step if you want unverified
  accounts restricted
- Consider moving from polling cron to a job queue (e.g. BullMQ) if you scale
  to many students/activities
- Serve the frontend build (`npm run build` in `frontend/`) behind a proper
  web server or CDN
