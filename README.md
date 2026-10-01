# ClinicFlow

ClinicFlow is a small clinic operations application for managing authentication, patients, appointments, and daily activity metrics.

The project is split into:

- `backend/` — Express API with PostgreSQL persistence, JWT authentication, role-based access control, and Prisma dashboard queries.
- `frontend/` — React application built with Vite, React Router, Zustand, Tailwind CSS, and shadcn-style UI primitives.
- `database/` — PostgreSQL migration and the project entity relationship diagram.

## Entity relationship diagram

![ClinicFlow entity relationship diagram](database/clinicflow-erd.jpg)

## Technology stack

### Backend

- Node.js and Express
- PostgreSQL with `pg`
- Prisma for dashboard reporting queries
- JWT authentication
- `bcrypt` password hashing
- CommonJS modules

### Frontend

- React
- Vite
- React Router
- Zustand with persisted local storage authentication state
- Tailwind CSS
- Reusable shadcn-style UI components

## Project structure

```text
ClinicFlow/
├── backend/
│   ├── prisma/
│   └── src/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       ├── services/
│       └── validation/
├── database/
│   ├── migrations/
│   └── clinicflow-erd.jpg
└── frontend/
    └── src/
        ├── components/
        │   └── ui/
        ├── pages/
        ├── services/
        └── stores/
```

## Prerequisites

- Node.js 18 or newer
- npm
- PostgreSQL

## Database setup

Create a PostgreSQL database and user matching the backend environment variables, then apply the migration:

```bash
psql "$DATABASE_URL" -f database/migrations/001_create_users_patients_appointments.sql
```

The schema contains:

- `users` — login identity and role (`admin` or `staff`)
- `patients` — demographic and contact information
- `appointments` — patient appointments, status, notes, and creator

The migration does not seed a user account. Create an account with a bcrypt password hash before testing login.

## Environment variables

Create `backend/.env` with the database and JWT settings:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=clinicflow
DB_USER=clinicflow_user
DB_PASSWORD=clinicflow_password
DATABASE_URL=postgresql://clinicflow_user:clinicflow_password@localhost:5432/clinicflow?schema=public
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=1h
PORT=3000
```

The frontend uses `frontend/.env.example` as its configuration reference:

```env
VITE_API_URL=http://localhost:3000
```

During Vite development, requests to `/api` use the configured proxy and remain relative to the frontend origin. `VITE_API_URL` is used as the API base URL for non-development builds.

## Running locally

Install backend dependencies and start the API:

```bash
cd backend
npm install
npm run dev
```

In a second terminal, install frontend dependencies and start Vite:

```bash
cd frontend
npm install
npm run dev
```

The frontend is available at `http://localhost:5173` and the backend at `http://localhost:3000`.

For a production frontend build:

```bash
cd frontend
npm run build
npm run preview
```

## Frontend routes

| Route | Purpose | Authentication |
| --- | --- | --- |
| `/login` | Sign in with email and password | Public |
| `/dashboard` | View patient and appointment summary metrics | Required |
| `/patients` | Search, paginate, add, and edit patients | Required |
| `/patients/:id` | View patient information and appointments | Required |
| `/appointments` | Filter, create, and update appointment status | Required |

Authenticated pages share a responsive sidebar/top navigation. Logging out clears the Zustand-persisted token and returns to `/login`.

## API overview

All protected requests use:

```http
Authorization: Bearer <jwt>
```

### Authentication

```http
POST /api/auth/login
```

Request body:

```json
{
  "email": "doctor@example.com",
  "password": "your-password"
}
```

Successful response:

```json
{
  "token": "<jwt>",
  "user": {
    "id": "<uuid>",
    "email": "doctor@example.com",
    "role": "staff"
  }
}
```

The API also exposes `GET /api/auth/me` for the authenticated user.

### Dashboard

```http
GET /api/dashboard
```

Returns:

```json
{
  "totalPatients": 0,
  "todaysAppointments": 0,
  "pendingAppointments": 0,
  "confirmedAppointments": 0
}
```

### Patients

```http
GET    /api/patients?page=1&limit=10&search=name-or-cin
GET    /api/patients/:id
POST   /api/patients
PATCH  /api/patients/:id
DELETE /api/patients/:id
```

Patient creation fields are `fullName`, `CIN`, `phone`, `birthDate` (`YYYY-MM-DD`), and optional `address`. The delete endpoint requires the `admin` role.

List responses include the patients and pagination metadata:

```json
{
  "patients": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

### Appointments

```http
GET   /api/appointments?patientId=<uuid>&status=pending&date=YYYY-MM-DD
POST  /api/appointments
PATCH /api/appointments/:id/status
```

Appointment creation requires `patientId`, `appointmentDate`, `status`, and `reason`; `notes` is optional. Supported statuses are:

- `pending`
- `confirmed`
- `cancelled`

## Authentication and authorization

- Login returns a JWT signed by the backend.
- The frontend persists the token with Zustand so refreshes retain authentication.
- Protected frontend routes redirect unauthenticated users to `/login`.
- The backend validates the JWT on protected API routes.
- Patient deletion is restricted to users with the `admin` role.

## Verification

Build the frontend with:

```bash
cd frontend
npm run build
```

The backend currently exposes a development watcher through `npm run dev`. There is no automated test script configured yet.
