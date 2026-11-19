# CourseForge — External Blockers & Action Items

This file tracks tasks that require user intervention (external credentials, service registrations, manual deployments, or irreversible actions).

---

## Current Status: No Active Blockers

All prerequisites for **Phase 1 (Router & Decomposition)**, **Phase 2 (Data-Access Layer)**, and **Phase 3 (Backend Completion)** are present in the repository and local environment.

---

## Upcoming Action Items (Ahead of Schedule)

### Phase 8: Cloudinary Storage Credentials
- **When needed**: Phase 8 (File Uploads & Study Materials).
- **Fallback**: A local disk storage adapter (`server/uploads/`) will be implemented as the default so development can proceed seamlessly without external credentials.
- **Action for User** (when ready for cloud storage):
  Provide in `server/.env`:
  ```env
  CLOUDINARY_CLOUD_NAME=your_cloud_name
  CLOUDINARY_API_KEY=your_api_key
  CLOUDINARY_API_SECRET=your_api_secret
  ```

### Phase 10: Stripe Test Keys
- **When needed**: Phase 10 (Payments Engine).
- **Fallback**: A mock payment provider will be implemented for offline end-to-end testing.
- **Action for User** (when ready to test live Stripe checkout):
  Provide in `server/.env` and `client/.env`:
  ```env
  STRIPE_SECRET_KEY=sk_test_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  VITE_STRIPE_PUBLIC_KEY=pk_test_...
  ```

### Phase 13: Cloud Deployment Setup
- **When needed**: Phase 13 (Deployment Prep).
- **Action for User**: Connect repository to Render (server) and Vercel (client), and configure environment variables in project settings.
