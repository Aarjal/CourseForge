# CourseForge — Project Progress

## Phase Checklist

- [x] **Phase 0: Housekeeping & Hygiene**
  - Git hygiene (`.gitignore`, untrack `.DS_Store`, `.env.example` templates).
  - Server dev scripts, nodemon, and dynamic CORS origin via `CLIENT_ORIGIN`.
  - Client start script and dead route cleanup in `home.jsx`.
  - Accurate README installation, environment, and feature documentation.
- [x] **Phase 1: Router & App.jsx Decomposition**
  - Added `react-router-dom` with `HashRouter`.
  - Routes: `/login`, `/`, `/courses`, `/courses/:courseId`, `/quiz`, `/admin`, `*` (404).
  - Built `ProtectedRoute` for student/admin routes.
  - Created `AuthContext` + `useAuth()` and `CourseContext` + `useCourses()`.
  - Centralized all `localStorage` calls into `services/storage.js`.
  - Connected quiz entry button on Course Details page for enrolled users.
  - Guarded `courseCard.jsx` with `course.challenge?.length ?? 0`.
  - Added unit and component test suite using Vitest + Testing Library (7 tests passing).
- [x] **Phase 2: Client Data-Access Layer**
  - Designed clean adapter interface with `mockAdapter` and `httpAdapter`.
  - Implemented versioned localStorage key `courseforge-courses-v2` with seamless migration from legacy `name`/`desc` schema and string durations.
  - Standardized all entities on `title`, `description`, and duration as `Number` (minutes).
  - Added dynamic adapter switching via `VITE_USE_MOCK` (defaults to `true`).
  - Wired `AuthContext` and `CourseContext` to the unified data adapter.
  - Added 5 unit tests for mock adapter and migration logic (12 client tests passing total).
- [x] **Phase 3: Backend Completion & API Hardening**
  - Extracted `app.js` from `server.js` for testability.
  - Complete chapter endpoints (GET all by course, GET by ID, create, update, delete, reorder).
  - Auto-assign chapter `order` server-side.
  - Centralized error-handling middleware (CastError, Mongoose ValidationError, Zod 4 issues, duplicate key, CORS).
  - Input validation with Zod schemas on all create/update routes.
  - Route prefix `/api/v1` with backward-compatible `/api` alias.
  - Course search, filtering (category, level, published), sorting, and pagination.
  - Replaced deprecated `{ new: true }` with `{ returnDocument: 'after' }`.
  - Deleted dead `client/src/api/courses.js` (superseded by adapter layer).
  - Server test suite: Jest + Supertest + MongoMemoryServer (10 tests passing).
  - Dependencies: `zod`, `jest`, `supertest`, `mongodb-memory-server`.
- [x] **Phase 4: Authentication & Roles**
  - User model with bcrypt password hashing (student, instructor, admin).
  - JWT access tokens (15m) + refresh tokens (7d) via cookies and Bearer headers.
  - Auth middleware `protect` (JWT validation) and `authorize` (role-based access control).
  - Auth routes: register, login, refresh, logout, me.
  - Required `createdBy` on courses, auto-populated from authenticated `req.user`.
  - Mutation endpoints on courses & chapters secured with role checks (instructor/admin).
  - Seed admin script (`npm run seed:admin`).
  - Auth integration tests (23 total server tests passing across 3 test suites).
  - Dependencies: `bcryptjs`, `jsonwebtoken`, `cookie-parser`.
- [x] **Phase 5: Connect Client to API**
  - Robust `httpAdapter` with paginated courses unwrapping and normalization.
  - Automatic token refresh interceptor on 401 status with concurrency queue.
  - Added user registration and role toggle in `login.jsx` and `AuthContext`.
  - Safely normalized course & chapter ID comparisons (`String(id)`) across `CourseContext` and `CourseDetails`.
  - Added loading, empty, and error feedback states in `Browse`, `CourseDetails`, and `Login`.
  - Maintained complete mock fallback for GitHub Pages deployment.
  - Expanded client test suite with 4 new tests for `httpAdapter` (16 client tests passing).
- [ ] **Phase 6: Real Enrollment & Progress Engine**
  - Enrollment & Progress models.
  - Server-enforced locked content rules (non-previews restricted to enrolled users).
  - Progress calculation, completion tracking, resume point.
- [ ] **Phase 7: Admin & Instructor Panel**
  - Course authoring, editing, publish toggle.
  - Chapter management and reordering.
  - Enrollment viewing and analytics overview.
- [ ] **Phase 8: File Uploads & Study Materials**
  - Cloudinary upload pipeline for videos & documents.
  - Local-disk storage fallback interface when credentials are not yet supplied.
  - Secure media URLs for enrolled content.
- [ ] **Phase 9: Quizzes & Assessment Engine**
  - Quiz, Question, Attempt models.
  - Admin quiz builder.
  - Student attempt tracking, scoring, pass thresholds.
- [ ] **Phase 10: Payment Engine (Stripe + Mock Provider)**
  - Payment provider abstraction.
  - Mock payment provider for offline testing.
  - Stripe webhook-verified enrollment unlocking.
- [ ] **Phase 11: Engagement, Certificates & Reviews**
  - Student reviews and course star ratings.
  - Automated PDF certificate generation on 100% course completion.
  - Notification hooks.
- [ ] **Phase 12: Polish, Hardening & Security Audit**
  - Mobile responsiveness and accessibility pass.
  - OWASP security review (helmet, rate limiting, mongo-sanitize, input validation).
  - Production seed data.
- [ ] **Phase 13: Deployment Readiness**
  - Render setup for backend, Vercel/Pages setup for frontend.
  - GitHub Actions CI (lint, test, build).
  - Production deployment runbook.
- [ ] **Phase 14: Mobile-Readiness & PWA**
  - Audit API contracts for mobile clients (Capacitor / React Native).
  - PWA manifest, service worker, offline shell.
  - Mobile architectural guide (`docs/MOBILE.md`).

---

## Last Completed Step
- **Phase 5 completed**: Full HTTP client adapter integration, automatic JWT refresh interceptor, registration form toggle, loading & error UI feedback, safe ID comparisons, and 16 passing client tests.

## What's Next
- **Phase 6: Real Enrollment & Progress Engine** — Mongoose Enrollment & Progress models, enrollment endpoints (`POST /api/v1/enrollments/:courseId`), chapter completion tracking (`POST /api/v1/progress/:courseId/chapters/:chapterId`), and server-enforced content access rules for locked chapters.

## How to Run & Test Current State
- **Client Dev**: `cd client && npm run dev` &rarr; `http://localhost:5173/CourseForge/`
- **Client Tests**: `cd client && npm test` (16 tests)
- **Client Build**: `cd client && npm run build`
- **Server Tests**: `cd server && npm test` (23 tests)
- **Server Admin Seed**: `cd server && npm run seed:admin`
- **Server**: `cd server && npm run dev`
