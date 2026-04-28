# Frontend Features → Backend API Mapping

This document maps each frontend feature to the backend API endpoints it depends on.

---

## Authentication (`src/pages/auth/`)

| Frontend Feature | Page | Backend API | Status |
|---|---|---|---|
| User login | `LoginPage.tsx` | `POST /api/auth/login` | ✅ Connected |
| User registration (role selection) | `RegisterPage.tsx` | `POST /api/auth/register` | ✅ Connected |
| Forgot password | `ForgotPasswordPage.tsx` | `POST /api/auth/forgot-password` | ✅ Connected |
| Reset password | `ResetPasswordPage.tsx` | `POST /api/auth/reset-password` | ✅ Connected |
| Auto-login on page load | `AuthContext.tsx` | `GET /api/auth/profile` | ✅ Connected |

## Profile Management (`src/pages/profile/`, `src/pages/settings/`)

| Frontend Feature | Page | Backend API | Status |
|---|---|---|---|
| View own profile | `SettingsPage.tsx` | `GET /api/auth/profile` | ✅ Connected |
| Update profile | `SettingsPage.tsx` | `PUT /api/auth/profile` | ✅ Connected |
| Change password | `SettingsPage.tsx` | `POST /api/auth/change-password` | ✅ Connected |
| Enable 2FA (mock OTP) | `SettingsPage.tsx` | `POST /api/auth/2fa/request` + `/2fa/verify` | ✅ Connected |
| View other profiles | `EntrepreneurProfile.tsx`, `InvestorProfile.tsx` | `GET /api/users/:id` | ✅ Connected |

## Dashboards (`src/pages/dashboard/`)

| Frontend Feature | Page | Backend API | Status |
|---|---|---|---|
| Investor dashboard — list entrepreneurs | `InvestorDashboard.tsx` | `GET /api/users?role=entrepreneur` | ✅ Connected |
| Investor dashboard — meeting count | `InvestorDashboard.tsx` | `GET /api/meetings` | ✅ Connected |
| Entrepreneur dashboard — list investors | `EntrepreneurDashboard.tsx` | `GET /api/users?role=investor` | ✅ Connected |
| Entrepreneur dashboard — meeting count | `EntrepreneurDashboard.tsx` | `GET /api/meetings` | ✅ Connected |

## User Discovery (`src/pages/investors/`, `src/pages/entrepreneurs/`)

| Frontend Feature | Page | Backend API | Status |
|---|---|---|---|
| Browse investors | `InvestorsPage.tsx` | `GET /api/users?role=investor` | ✅ Connected |
| Browse entrepreneurs | `EntrepreneursPage.tsx` | `GET /api/users?role=entrepreneur` | ✅ Connected |
| Search users | Both pages | `GET /api/users?search=...` | ✅ Connected |

## Meeting Scheduling (`src/pages/meetings/`)

| Frontend Feature | Page | Backend API | Status |
|---|---|---|---|
| Schedule a meeting | `MeetingsPage.tsx` | `POST /api/meetings/schedule` | ✅ Connected |
| List meetings | `MeetingsPage.tsx` | `GET /api/meetings` | ✅ Connected |
| Accept/reject meetings | `MeetingsPage.tsx` | `PUT /api/meetings/:id/status` | ✅ Connected |
| Calendar view | `MeetingsPage.tsx` | `GET /api/meetings` (data for react-big-calendar) | ✅ Connected |
| ICS calendar export | `MeetingsPage.tsx` | Client-side ICS generation from meeting data | ✅ Connected |

## Video Calling (`src/pages/meetings/`)

| Frontend Feature | Page | Backend API | Status |
|---|---|---|---|
| Join video room | `MeetingRoomPage.tsx` | `GET /api/meetings/room/:roomId` + Socket.IO | ✅ Connected |
| WebRTC signaling | `MeetingRoomPage.tsx` | Socket.IO events (offer, answer, ice-candidate) | ✅ Connected |
| Toggle audio/video | `MeetingRoomPage.tsx` | Socket.IO `toggle-media` event | ✅ Connected |

## Document Chamber (`src/pages/documents/`)

| Frontend Feature | Page | Backend API | Status |
|---|---|---|---|
| Upload document | `DocumentsPage.tsx` | `POST /api/documents/upload` (multipart) | ✅ Connected |
| List documents | `DocumentsPage.tsx` | `GET /api/documents` | ✅ Connected |
| Preview document | `DocumentsPage.tsx` | Static file served from `/uploads/` | ✅ Connected |
| Sign document (e-signature) | `DocumentsPage.tsx` | `POST /api/documents/:id/sign` (multipart) | ✅ Connected |

## Payment Sandbox (`src/pages/deals/`)

| Frontend Feature | Page | Backend API | Status |
|---|---|---|---|
| Create deposit | `DealsPage.tsx` | `POST /api/payments/deposit` | ✅ Connected |
| Create withdrawal | `DealsPage.tsx` | `POST /api/payments/withdraw` | ✅ Connected |
| Create transfer | `DealsPage.tsx` | `POST /api/payments/transfer` | ✅ Connected |
| Transaction history | `DealsPage.tsx` | `GET /api/payments/history` | ✅ Connected |
| List users for transfer | `DealsPage.tsx` | `GET /api/users` | ✅ Connected |

## Pages Using Static/Mock Data (No Backend API Needed)

| Page | Notes |
|---|---|
| `MessagesPage.tsx` | UI present, uses local mock data |
| `ChatPage.tsx` | UI present, uses local mock data |
| `NotificationsPage.tsx` | UI present, uses local mock data |
| `HelpPage.tsx` | Static content page |
