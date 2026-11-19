# CourseForge — Architectural & Product Decisions

This log documents every architectural, technical, and product design decision made in the CourseForge codebase.

---

### [2026-11-19] Decision 1: HashRouter for Initial Client Routing
- **Context**: The client is deployed on GitHub Pages (`https://aarjal.github.io/CourseForge/`) where path routing (`BrowserRouter`) without server-side catch-all rewrite rules produces 404 errors on page refreshes.
- **Decision**: Use `react-router-dom` with `HashRouter` for Phase 1.
- **Migration Path**: Will switch to `BrowserRouter` when deploying to Vercel/production with full SPA rewrite configuration in Phase 13.

### [2026-11-19] Decision 2: Schema Field Standardization (`title` / `description`)
- **Context**: The frontend mock data previously used `name` and `desc`, while Mongoose models in `server/src/models/` defined `title` and `description`.
- **Decision**: Standardize on `title` and `description` across the entire codebase (frontend and backend).
- **Migration**: A versioned localStorage key (`courseforge-courses-v2`) will be used with an auto-migration script to transform existing client data without breaking the demo.

### [2026-11-19] Decision 3: Chapter Duration Representation
- **Context**: Mock data contained string duration labels like `"15 mins"`, while the database schema specifies `duration: Number`.
- **Decision**: Store `duration` as a Number (minutes) in the database and data layer; format as `"X mins"` strictly in presentation components.

### [2026-11-19] Decision 4: Optional Challenge Property
- **Context**: Mock courses contained lab challenges, but backend roadmap focuses on chapters, study materials, and quizzes.
- **Decision**: Keep `challenge` as an optional property on courses and guard UI rendering with optional chaining (`course.challenge?.length ?? 0`) to prevent runtime crashes.

### [2026-11-19] Decision 5: Course `createdBy` Requirement
- **Context**: `server/src/models/course.js` marked `createdBy` as a required ObjectId, preventing course creation prior to auth implementation.
- **Decision**: Temporarily make `createdBy` optional with a `// TODO(phase 4): restore required: true when User auth is active` comment until Phase 4 (Auth) introduces the User model.

### [2026-11-19] Decision 6: Client Data Adapter Architecture
- **Context**: The GitHub Pages live demo must remain functional while the live backend and API integration are developed.
- **Decision**: Build an abstracted client service interface (`api/client.js`) supporting two interchangeable implementations:
  1. `mockAdapter`: LocalStorage-based, fully offline.
  2. `httpAdapter`: Axios/fetch-based, connecting to `/api/v1`.
  Switched dynamically via `import.meta.env.VITE_USE_MOCK`.

### [2026-11-19] Decision 7: Stateless JWT Authentication Strategy
- **Context**: CourseForge needs to support web and future mobile clients (Capacitor/React Native).
- **Decision**: Use short-lived JWT access tokens and long-lived refresh tokens. Support both httpOnly cookies (secure browser defaults) and the `Authorization: Bearer <token>` header (mobile/API clients).

### [2026-11-19] Decision 8: Server-Enforced Security Model
- **Context**: In an e-learning platform, paid/locked chapter content must never rely solely on UI-level hiding (`isLocked ? null : <Content />`).
- **Decision**: Course details return chapter metadata (title, order, preview flag) for everyone, but full chapter content (videos, documents, lecture notes) will be served by a protected endpoint that checks enrollment verification on the server.

### [2026-11-19] Decision 9: Testing Frameworks (Vitest + Testing Library)
- **Context**: Need fast, ESM-native unit and component testing that integrates seamlessly with Vite.
- **Decision**: Installed `vitest`, `jsdom`, and `@testing-library/react` in `client/` for component and unit testing.

### [2026-11-19] Decision 10: React Context & Hook File Separation
- **Context**: Oxlint enforces `react(only-export-components)` for Vite React Fast Refresh compliance.
- **Decision**: Separated context definitions (`authContextDef.js`, `courseContextDef.js`), providers (`AuthContext.jsx`, `CourseContext.jsx`), and consumer hooks (`hooks/useAuth.js`, `hooks/useCourses.js`) to guarantee clean Fast Refresh without lint warnings.


### [2026-11-19] Decision 11: Server Testing Stack (Jest + Supertest + MongoMemoryServer)
- **Context**: Need integration tests for API endpoints without hitting the real MongoDB Atlas database.
- **Decision**: Use `jest` as the test runner, `supertest` for HTTP assertions against the Express app, and `mongodb-memory-server` for an in-memory MongoDB instance. Tests run with `--experimental-vm-modules` flag to work around Mongoose 9's dynamic `import('os')` in Jest's CommonJS environment.

### [2026-11-19] Decision 12: Zod for Server Input Validation
- **Context**: Need runtime schema validation on request bodies before they hit Mongoose.
- **Decision**: Use Zod (v4) for all route-level input validation via a `validate()` middleware. Zod provides TypeScript-friendly schema definitions, composable validators, and clear error messages. Note: Zod 4 uses `err.issues` (not `err.errors`) for error details.

### [2026-11-19] Decision 13: Express App / Server Separation
- **Context**: Testing the Express app with Supertest requires importing the app without starting the HTTP listener.
- **Decision**: Extract `app.js` (Express config, middleware, routes) from `server.js` (which only connects to DB and calls `app.listen`). Tests import `app.js` directly.

### [2026-11-19] Decision 14: Mongoose `returnDocument: 'after'` over `new: true`
- **Context**: Mongoose 9 deprecated the `new: true` option for `findOneAndUpdate()`.
- **Decision**: Use `{ returnDocument: 'after' }` throughout all controllers. Same behavior, no deprecation warnings.
