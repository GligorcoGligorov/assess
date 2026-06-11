# RentEase — Property Rental Platform

A full-stack property rental platform built as a practical assessment for BETWEEN. Built from scratch with a clean architecture, TypeScript throughout, and a production-grade feature set.

**Live Demo:** https://assess-xi.vercel.app  
**Backend API:** https://assess-production-88f4.up.railway.app/health

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Owner | demo@rentease.com | demo123 |
| Renter | Register a new account | — |

---

## Screenshots

### Home Page
![Home Page](screenshots/Screenshot%202026-06-11%20at%2017.37.00.png)

### Property Listings
![Property Detail](screenshots/Screenshot%202026-06-11%20at%2017.37.19.png)
![Login](screenshots/Screenshot%202026-06-11%20at%2017.37.27.png)

### Property Detail
![Register](screenshots/Screenshot%202026-06-11%20at%2017.38.13.png)

### Login
![Dashboard Renter](screenshots/Screenshot%202026-06-11%20at%2017.41.24.png)


### Register
![Dashboard Owner](screenshots/Screenshot%202026-06-11%20at%2017.41.34.png)

### Dashboard (Owner)
![Create Property](screenshots/Screenshot%202026-06-11%20at%2017.38.55.png)

### Dashboard (Renter)


### Messages


### Create Property
![Messages](screenshots/Screenshot%202026-06-11%20at%2017.39.23.png)


## Tech Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS, Zustand, React Router, Socket.io-client  
**Backend:** Node.js, Express, TypeScript, PostgreSQL, Socket.io  
**Database:** Supabase (PostgreSQL)  
**Deploy:** Vercel (frontend) + Railway (backend)

---

## Features

- **Auth** — JWT access + refresh token flow, bcrypt password hashing, rate limiting on auth routes
- **Properties** — Full CRUD, search/filter by city/type/price, pagination
- **Bookings** — Availability check with overlap detection, automatic price calculation, status flow (pending → confirmed/cancelled/completed)
- **Messaging** — Real-time chat between renters and owners via Socket.io, REST fallback for message history
- **Reviews** — Star rating system, only users with completed bookings can review
- **Dashboard** — Role-based views for owners (properties + incoming bookings) and renters (their bookings)

---

## Architecture Decisions

**Why TypeScript end-to-end?** Type safety across the stack catches bugs at compile time, not runtime. Especially valuable for the booking/availability logic where date handling errors are costly.

**Why PostgreSQL over MongoDB?** The data model is inherently relational — users own properties, bookings reference both users and properties, reviews link to bookings. SQL with foreign keys and `OVERLAPS` for date conflict detection is the right tool.

**Why Zustand over Redux?** Minimal boilerplate for the auth state we needed. The store is 50 lines and does everything required.

**Why clean architecture (routes/controllers/services)?** Single responsibility — routes handle HTTP, controllers handle business logic, config handles infrastructure. Easy to test each layer independently.

---

## Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL (or Supabase account)

### Backend
```bash
cd server
npm install
cp .env.example .env
# Fill in DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET
npm run dev
```

### Database
Run the SQL from the Supabase SQL editor to create tables, then:
```bash
npm run seed
```

### Frontend
```bash
cd client
npm install
cp .env.example .env
# Set VITE_API_URL and VITE_SOCKET_URL
npm run dev
```

---

## API Endpoints
---
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
GET    /api/auth/me
GET    /api/properties          # public, supports ?city=&type=&minPrice=&maxPrice=&page=
GET    /api/properties/:id
POST   /api/properties          # owner only
PUT    /api/properties/:id      # owner only
DELETE /api/properties/:id      # owner only
POST   /api/bookings
GET    /api/bookings/my
GET    /api/bookings/my-properties
GET    /api/bookings/property/:id
PATCH  /api/bookings/:id/status
POST   /api/messages
GET    /api/messages
GET    /api/messages/conversations
POST   /api/reviews/:property_id
GET    /api/reviews/:property_id
```
---
## Trade-offs & What I'd Add Next

- **Image upload** — Cloudinary integration is planned. Currently properties use Unsplash URLs. The backend accepts an `images` array so the frontend change is minimal.
- **Email notifications** — Booking confirmation emails via Resend or SendGrid.
- **Search improvements** — Full-text search with PostgreSQL `tsvector` for property titles/descriptions.
- **Testing** — Jest + Supertest for auth and booking routes. The overlap detection logic is the highest-priority test case.
