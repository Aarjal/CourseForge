# CourseForge — Project Progress

## Phase Checklist

- [x] **Phase 0: Housekeeping & Hygiene**
  - Git hygiene (`.gitignore`, untrack `.DS_Store`, `.env.example` templates).
  - Server dev scripts, nodemon, and dynamic CORS origin via `CLIENT_ORIGIN`.
  - Client start script and dead route cleanup in `home.jsx`.
  - Accurate README installation, environment, and feature documentation.
- [ ] **Phase 1: Router & App.jsx Decomposition** *(IN PROGRESS)*
  - Install `react-router-dom` (HashRouter for GitHub Pages compatibility).
  - Contexts & Hooks (`AuthContext`, `CourseContext`).
  - Isolated localStorage state module.
  - Route structure (`/login`, `/`, `/courses`, `/courses/:courseId`, `/quiz`, `/admin`, `*`).
  - `ProtectedRoute` wrapper for student and admin areas.
  - Wire quiz entry button on Course Details page (enrolled students only).
  - Guard `courseCard.jsx` with `course.challenge?.length ?? 0`.
- [ ] **Phase 2: Client Data-Access Layer**
  - Adapter interface for courses, chapters, progress, and auth.
  - Mock implementation using `courseforge-courses-v2` in localStorage (migrating old data).
  - HTTP implementation ready for live API (`VITE_USE_MOCK` toggle).
  - Standardize all objects on `title` and `description`, duration as `Number` (minutes).
- [ ] **Phase 3: Backend Completion & API Hardening**
  - Complete chapter endpoints (GET chapters for course, auto `order`, reordering).
  - Centralized error-handling middleware & CastError handling.
  - Route prefix `/api/v1`.
  - Course search, filtering, and pagination.
  - Server tests (Jest/Vitest + Supertest + MongoMemoryServer).
- [ ] **Phase 4: Authentication & Roles**
  - User model (student, instructor/admin).
  - JWT access tokens + refresh tokens (httpOnly cookies + Bearer header for mobile).
  - Password hashing with bcrypt.
  - Auth & role-based middleware.
  - Seed script for initial admin user.
  - Client auth UI & state wired to live backend.
- [ ] **Phase 5: Connect Client to API**
  - Switch to HTTP adapter in development (`VITE_USE_MOCK=false`).
  - Token refresh handling, loading/empty/error states.
  - Maintain mock fallback for GitHub Pages demo.
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
- **Phase 0 completed**: Git hygiene, server nodemon/CORS configuration, client dead code cleanup, README updates, verification tests passed.

## What's Next
- **Phase 1 implementation**: Decompose `App.jsx`, install `react-router-dom`, establish `AuthContext` and `CourseContext`, introduce `ProtectedRoute`, wire routes, and run verification.

## How to Run & Test Current State
- **Client**: `cd client && npm run dev` &rarr; `http://localhost:5173/CourseForge/`
- **Server**: `cd server && npm run dev` &rarr; `http://localhost:5000`
- **Health check**: `curl.exe -i http://localhost:5000/api/health`
