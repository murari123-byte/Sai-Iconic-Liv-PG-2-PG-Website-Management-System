# Sai Iconic Liv — Men's & Co-Living PG-2

A full-stack starter website using React + Vite, Spring Boot (Java 21), and PostgreSQL. Property images included in this project were supplied in the conversation; no remote stock photos are used.

## Confirmed property information
- **Name:** Sai Iconic Liv — Men's & Co-Living PG-2
- **Address:** Plot No. 74, Golden Mile Road, Kokapet, Hyderabad, Telangana 500075
- **WhatsApp contact configured for website:** +91 8498869530
- **Monthly rent per person:** 2-sharing ₹12,000; 3-sharing ₹9,000; 4-sharing ₹7,800
- **Joining advance:** ₹3,000 payable at joining

The property signboard in the uploaded photo displays different contact numbers. The website uses the WhatsApp number explicitly provided in chat. Confirm this before publishing.

## Frontend
Requires Node.js 20+ recommended.

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Open http://localhost:5173.

The website still works as a public brochure if the backend is offline. The enquiry form opens WhatsApp as a fallback.

## PostgreSQL
Option A: Docker Desktop installed and running:

```powershell
docker compose up -d postgres
```

Option B: Use a local PostgreSQL installation and create database `sai_iconic_liv`.

Default local development credentials are configured in `backend/src/main/resources/application.properties` (postgres/postgres). Change these for your own local database. Never use development credentials in production.

## Backend
Requires Java 21 and Maven.

```powershell
cd backend
mvn spring-boot:run
```

API base URL: http://localhost:8080/api
Health check: http://localhost:8080/api/health

The first startup creates tables and seeds the three room-sharing options. `spring.jpa.hibernate.ddl-auto=update` is intended for local development; use migrations and `validate` in production.

### API endpoints
- `GET /api/rooms` — active room-sharing options
- `POST /api/enquiries` — save an enquiry
- `POST /api/auth/login` — authenticate admin and get JWT token
- `GET /api/admin/rooms` — list rooms for admin work
- `POST /api/admin/rooms` — create a room
- `PUT /api/admin/rooms/{id}` — update a room
- `DELETE /api/admin/rooms/{id}` — delete a room
- `GET /api/admin/enquiries` — list enquiries
- `PATCH /api/admin/enquiries/{id}/contacted` — mark an enquiry contacted
- `GET /api/admin/pg-rooms` — manage physical PG rooms & occupancy
- `GET /api/admin/residents` — search/manage residents and bed allocations
- `GET /api/admin/payments/summary` — view monthly rent status and track balances
- `POST /api/admin/residents/{residentId}/payments` — record rent payments

**Security note:** Admin endpoints are protected by JWT authentication. Ensure you configure your production environment with a strong `jwt.secret` and never expose your database credentials publicly. Configure HTTPS, database migrations, backups, and rate limiting before production release.

## Images
All project images are in `frontend/public/images`. To replace an image, keep the filename or update its path in `frontend/src/App.jsx`. The room photo for each sharing option opens in a clickable detail modal. Original uploaded room photos are used without enhancement.

## Current scope
Includes the responsive homepage, room detail modal, room rent/deposit, enquiry form with WhatsApp fallback, facilities, property gallery, directions link, and full-stack management features for residents, payments, and admin enquiries with JWT-based authentication. The application is ready for deployment to a production environment with proper configuration of security secrets and database credentials.
