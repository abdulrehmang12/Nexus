# Nexus — Full-Stack Demo Presentation

## Investor & Entrepreneur Collaboration Platform

---

## 📌 Project Overview

**Nexus** is a full-stack web platform connecting **investors** and **entrepreneurs** through a comprehensive suite of collaboration tools.

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend | Node.js + Express 5 |
| Database | MongoDB + Mongoose |
| Real-time | Socket.IO + WebRTC |
| Deployment | Vercel (frontend) + Render (backend) |

---

## 🔐 Module 1 — Authentication & Profiles

### Features
- **JWT-based authentication** with 8-hour token expiry
- **Role selection** at registration — Investor or Entrepreneur
- **Extended profiles** with role-specific fields:
  - Entrepreneurs: startup name, pitch summary, funding needed, industry, team size
  - Investors: investment interests, portfolio companies, investment stage, min/max investment
- **Password management**: change password, forgot/reset password flow
- **Two-factor authentication (2FA)**: mock OTP generation and verification

### Security Highlights
- Passwords hashed with **bcrypt** (salt rounds: 10)
- Input **sanitization** strips HTML tags, enforces length limits
- **Rate limiting**: 50 requests / 15 min for auth, 300 / 15 min for API
- **Helmet** security headers applied
- **Role-based authorization** middleware on all protected routes

### Working Flow
1. User registers → selects role → profile created in MongoDB
2. JWT token issued → stored in localStorage → sent as Bearer token
3. Profile page loads from DB → editable fields → saved via PUT /api/auth/profile

---

## 📅 Module 2 — Meeting Scheduling Calendar

### Features
- **Schedule meetings** with any registered user
- **Conflict detection** — prevents double-booking for both host and guest
- **Accept / Reject** meeting invitations
- **Calendar view** powered by `react-big-calendar` (month, week, day, agenda)
- **ICS file export** — download `.ics` calendar invites for Outlook / Google Calendar
- **Video room link** auto-generated for each meeting

### Working Flow
1. Select a guest → pick date/time → add notes → schedule
2. Backend checks for time conflicts → creates meeting with unique room ID
3. Calendar shows all meetings → click to accept/reject or join video room
4. Download ICS file → opens in native calendar app

---

## 🎥 Module 3 — Video Calling (WebRTC)

### Features
- **WebRTC peer-to-peer** video/audio calls
- **Socket.IO signaling server** for offer/answer/ICE candidate exchange
- **Toggle audio/video** during call
- **End call** with proper cleanup (disconnect socket, close peer, stop media)
- **Room-based** — only meeting participants can join

### Architecture
```
User A ──► Socket.IO Server ◄── User B
  │         (signaling)          │
  └───── WebRTC P2P Call ────────┘
```

### Working Flow
1. User clicks "Join Room" on a scheduled meeting
2. Browser requests camera/microphone access
3. Socket.IO connection established → join room event emitted
4. When second participant joins → WebRTC offer/answer exchange begins
5. ICE candidates exchanged → direct P2P media stream established

---

## 📄 Module 4 — Document Chamber with E-Signature

### Features
- **Drag & drop upload** via `react-dropzone` (PDF, Word, Excel, images, JSON, text)
- **10 MB file size limit** with MIME type validation
- **Document preview** in-browser via embedded iframe
- **E-signature** — upload a signature image → linked to document record
- **Version tracking** and status management (pending → signed)
- **Metadata stored** in DB: uploaded by, version, status, timestamps

### Supported File Types
| Type | Extensions |
|------|-----------|
| PDF | .pdf |
| Word | .doc, .docx |
| Excel | .xls, .xlsx |
| Images | .png, .jpg, .svg |
| Data | .json, .txt |

### Working Flow
1. Drag file into dropzone → add title → click Upload
2. Document stored on server → metadata saved to MongoDB
3. Click document → preview loads in iframe
4. Upload signature image → document status changes to "signed"

---

## 💳 Module 5 — Payment Sandbox

### Features
- **Mock Stripe & PayPal** integration (sandbox simulation)
- **Three transaction types**: Deposit, Withdraw, Transfer
- **Configurable outcome**: pending, completed, or failed
- **Transaction history** with provider badges, references, and timestamps
- **Transfer to other users** — select recipient from user list

### Data Model
```
Transaction {
  type:      deposit | withdraw | transfer
  provider:  stripe | paypal
  status:    pending | completed | failed
  amount:    Number
  reference: "DEPOSIT-1714300000000"
  providerSessionId: "stripe_sandbox_abc123"
}
```

### Working Flow
1. Select provider (Stripe/PayPal) → choose sandbox result status
2. Enter amount → click Deposit / Withdraw / Transfer
3. Backend creates transaction record with unique reference
4. Transaction history table updates in real-time

---

## 🛡️ Module 6 — Security Features

| Feature | Implementation |
|---------|---------------|
| Password hashing | bcrypt with 10 salt rounds |
| JWT tokens | 8-hour expiry, secret from environment variable |
| Input sanitization | Strip `<>` tags, whitespace normalization, length limits |
| Rate limiting | express-rate-limit (auth: 50/15min, API: 300/15min) |
| Security headers | Helmet middleware |
| Role-based access | authorize() middleware on all protected routes |
| 2FA mockup | 6-digit OTP with 10-minute expiry |
| CORS | Configurable allowed origins |

---

## 🚀 Deployment

### Frontend (Vercel)
- SPA rewrite rules configured in `vercel.json`
- Environment variable `VITE_API_URL` points to backend

### Backend (Render)
- `render.yaml` configures Node.js web service
- Health check endpoint at `/api/health`
- MongoDB Atlas for production database

### Environment Variables
| Variable | Purpose |
|----------|---------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Token signing secret |
| `CORS_ORIGINS` | Allowed frontend origins |
| `VITE_API_URL` | Backend API base URL |

---

## 📚 API Documentation

Interactive Swagger documentation available at:

```
GET /api/docs
```

**19 documented endpoints** across 5 modules:
- Auth (9 endpoints)
- Users (2 endpoints)
- Meetings (4 endpoints)
- Documents (3 endpoints)
- Payments (5 endpoints)

All endpoints include:
- Request body schemas with validation rules
- Response schemas with model references
- Error response documentation
- Authentication requirements

---

## 🏗️ Project Structure

```
Nexus/
├── src/                    # React frontend
│   ├── components/         # Reusable UI components
│   ├── context/            # AuthContext (global state)
│   ├── lib/                # Axios API client
│   ├── pages/              # 13 page modules
│   └── types/              # TypeScript interfaces
├── backend/
│   └── src/
│       ├── config/         # Database configuration
│       ├── controllers/    # (Architecture notes)
│       ├── docs/           # Swagger/OpenAPI spec
│       ├── middlewares/    # auth + authorize
│       ├── models/         # Mongoose schemas (4)
│       ├── routes/         # Express routers (5)
│       └── utils/          # Input validation
├── vercel.json             # Frontend deploy config
└── render.yaml             # Backend deploy config
```

---

## ✅ Deliverables Summary

| Deliverable | Status |
|------------|--------|
| Authentication & Profiles | ✅ Complete |
| Meeting Scheduling Calendar | ✅ Complete |
| Video Calling (WebRTC) | ✅ Complete |
| Document Chamber + E-Signature | ✅ Complete |
| Payment Simulation | ✅ Complete |
| Security Features | ✅ Complete |
| GitHub Repository | ✅ Complete |
| Deployment Configs | ✅ Complete |
| API Documentation (Swagger) | ✅ Complete |
| Demo Presentation | ✅ This document |
