# Weekly Documentation — Nexus Full-Stack Development

---

## Week 1 — Setup & Core Backend Foundations

### Work Completed

#### Milestone 1: Environment Setup & Codebase Familiarization
- Forked and cloned the [Nexus frontend repo](https://github.com)
- Initialized Node.js + Express backend in `backend/` directory
- Configured MongoDB via Mongoose (`backend/src/config/db.js`)
- Connected frontend to backend using Axios client (`src/lib/api.ts`) with `VITE_API_URL` env variable
- Documented frontend features requiring backend APIs (see `docs/FRONTEND_API_MAPPING.md`)

#### Milestone 2: User Authentication & Profiles
- Implemented JWT-based authentication with 8-hour token expiry
- Built role-based registration — user selects **Investor** or **Entrepreneur** at signup
- Created API endpoints:
  - `POST /api/auth/register` — with password hashing (bcrypt, 10 rounds)
  - `POST /api/auth/login` — JWT issued on successful login
  - `GET /api/auth/profile` — fetch authenticated user
  - `PUT /api/auth/profile` — update profile with role-specific fields
- Extended User model with profile fields:
  - Common: bio, location, preferences, avatarUrl
  - Entrepreneur: startupName, pitchSummary, fundingNeeded, industry, foundedYear, teamSize, startupHistory
  - Investor: investmentInterests, investmentStage, portfolioCompanies, totalInvestments, min/maxInvestment, investmentHistory
- Built separate dashboard views: `EntrepreneurDashboard` and `InvestorDashboard`
- Added `DashboardLayout` with role-based redirect (`/dashboard` → `/dashboard/entrepreneur` or `/dashboard/investor`)

### Deliverables
- [x] GitHub repo with backend setup
- [x] Functional authentication system (register, login, JWT)
- [x] Profiles stored and retrieved from MongoDB

---

## Week 2 — Collaboration & Document Handling

### Work Completed

#### Milestone 3: Meeting Scheduling System
- Created Meeting model: title, host, guest, status, date, durationMinutes, notes, roomLink, calendarEventId
- Built API endpoints:
  - `POST /api/meetings/schedule` — with conflict detection to prevent double-booking
  - `GET /api/meetings` — list user's meetings (as host or guest)
  - `PUT /api/meetings/:id/status` — accept or reject meeting invitations
  - `GET /api/meetings/room/:roomId` — get meeting room details
- Integrated `react-big-calendar` on the frontend with month/week/day/agenda views
- Implemented `.ics` file export for calendar sync (Outlook, Google Calendar)
- Added participant validation — only host or guest can access/modify meetings

#### Milestone 4: Video Calling Integration
- Set up WebRTC signaling server with Socket.IO in `backend/src/index.js`
- Socket events: `join-room`, `offer`, `answer`, `ice-candidate`, `toggle-media`, `user-disconnected`
- Built `MeetingRoomPage.tsx` with:
  - Local and remote video streams via `RTCPeerConnection`
  - STUN server configuration (`stun:stun.l.google.com:19302`)
  - Toggle audio/video buttons
  - End call with proper cleanup (disconnect socket, close peer, stop tracks)

#### Milestone 5: Document Processing Chamber
- Created Document model: title, url, uploadedBy, version, status, signatureImageUrl
- Built API endpoints:
  - `POST /api/documents/upload` — Multer-based file upload with 10MB limit and MIME validation
  - `POST /api/documents/:id/sign` — attach e-signature image to document
  - `GET /api/documents` — list all documents with uploader info
- Built `DocumentsPage.tsx` with:
  - Drag-and-drop upload via `react-dropzone`
  - In-browser document preview
  - E-signature upload with stored signature image display
  - Version tracking and status badges (pending/signed)
- Supported file types: PDF, Word, Excel, images, JSON, plain text

### Deliverables
- [x] Functional APIs for scheduling meetings, handling video calls, and document management
- [x] Frontend connected to backend for all 3 modules

---

## Week 3 — Payments, Security & Deployment

### Work Completed

#### Milestone 6: Payment Section (Mock Integration)
- Created Transaction model: user, counterpartyUserId, type, provider, paymentMethod, amount, status, reference, providerSessionId, note
- Built sandbox payment APIs:
  - `GET /api/payments/providers` — list available providers (Stripe, PayPal)
  - `POST /api/payments/deposit` — create deposit transaction
  - `POST /api/payments/withdraw` — create withdrawal transaction
  - `POST /api/payments/transfer` — transfer to another user
  - `GET /api/payments/history` — transaction history
- Built `DealsPage.tsx` — gateway setup, deposit/withdraw/transfer forms, transaction history table with status badges

#### Milestone 7: Security Enhancements
- Input sanitization: strips `<>` tags, whitespace normalization, length limits (`utils/validation.js`)
- Password hashing: bcrypt with 10 salt rounds
- JWT tokens: 8-hour expiry, secret from environment variable
- Rate limiting: `express-rate-limit` — auth: 50/15min, API: 300/15min
- Security headers: `helmet` middleware
- Role-based authorization: `authorize()` middleware applied to all protected routes
- 2FA mockup: `POST /api/auth/2fa/request` generates 6-digit OTP with 10-min expiry, `POST /api/auth/2fa/verify` enables 2FA
- CORS: configurable allowed origins from environment variable

#### Milestone 8: Final Integration & Deployment
- Integrated all modules into unified SPA with shared layout and navigation
- Frontend deployment: `vercel.json` with SPA rewrite rules, `.env.production` for backend URL
- Backend deployment: `render.yaml` with Node.js web service config, health check endpoint
- API documentation: Swagger UI at `/api/docs` with OpenAPI 3.0 spec covering all 19 endpoints and 5 model schemas
- Demo presentation: `DEMO_PRESENTATION.md` with full walkthrough of all modules

### Deliverables
- [x] Fully functional Nexus platform (frontend + backend)
- [x] Production-ready deployment configurations
- [x] API documentation (Swagger)
- [x] Demo presentation with working flows
