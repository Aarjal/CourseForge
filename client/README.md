<!--
HOW TO USE THIS TEMPLATE
- Everything in [BRACKETS] is a placeholder — replace it with your own words.
- Italic notes like *(suggestion: ...)* are guidance for you, delete them once you've written the real content.
- Delete this whole comment block before you commit.
-->

<p align="center">
  <img src="assets/logo.png" alt="CourseForge logo" width="120"/>
</p>

<h1 align="center">CourseForge</h1>
<p align="center"><i>An E-learning platform for enthusiastic learners with every resource and services they'd ever seek. </i></p>

---

## Current Status of the platform

We're still in building phase as this is the first week of development. The groundwork for the application is there but there's yet to add lots and lots of functionality. However, a simple general workflow is still possible with the current version. The UI/UX isn't there yet indeed but for now we're just happy with how it works.

---

## About CourseForge

CourseForge is a full-stack web application where-
--admins can build and design any structured courses out of respective chapters and learning materials 
--students can browse, enroll, work through the available content at their own pace.
And ideally later on..
  The courses will be organized and structured into different chapters, with individual places of content like( docs, recorded lectures etc.) which will be LOCKED until a student enrolls. After enrollment, the student can access their unlocked course materials, complete different quizzes of their choice and most importantly track their progress as they move through it. Admins will be able to manage the full lifecycle on their end (creating and editing courses, uploading study materials and reviewing who have enrolled).


---

## App Features

*(suggestion: split by role, keep each bullet to one line. Mark anything not built yet as "planned" — don't let this list imply more than exists today.)*

**Student side**
- [ Browse through the available courses ] 
- [ Enroll via payment flow ] 
- [ Access their unlocked contents ] 
- [ Take quizzes on topics of their choice ] 
- [ Track their progress ] 

**Admin side**
- [ ] [e.g. Create/edit/delete courses]
- [ ] [e.g. Upload learning materials]
- [ ] [e.g. Manage enrollments]
- [ ] [e.g. Build quizzes]

---

## 🛠️ Tech Stack

- ** React with Vite - Frontend
- ** Node JS with Express - Backend (planning)
- ** Cloudinary - File storage (planning)
- ** JWT - Authentication (planning)
- ** Vercel and Render - Deployment

---

## Some Glimpses

*(suggestion: even 1–2 images of what exists now — homepage, login page — go a long way for a first ship. Use this markdown pattern:)*

`![Homepage](path/to/screenshot.png)`

[ADD SCREENSHOTS HERE ONCE YOU HAVE THEM]

---

## 🚀 Getting Started

*(suggestion: only document what's actually runnable today — don't describe steps or endpoints that don't exist yet)*

### Prerequisites
- Node.js [version]
- MongoDB [Atlas URI or local]
- [Any other required accounts/keys, e.g. Cloudinary]

### Installation

```bash
# Clone the repo
git clone [YOUR_REPO_URL]
cd coursforge

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Environment Variables

*(suggestion: list the .env keys needed, without real secret values)*

Create a `.env` file in `/server`:
```
PORT=[value]
MONGO_URI=[value]
JWT_SECRET=[value]
CLOUDINARY_API_KEY=[value]
```

### Running locally

```bash
# Start backend
cd server
npm run dev

# Start frontend (in a separate terminal)
cd client
npm start
```

---

## 🗺️ Roadmap

*(suggestion: high-level only, one line per week — shows direction without over-detailing)*

- **Week 1:** Auth system, homepage, foundational setup
- **Week 2:** Course & chapter management, file uploads
- **Week 3:** Enrollment flow, quizzes, progress tracking
- **Week 4:** Integration, deployment, polish

---

## 👥 Team

*(suggestion: names + rough role split)*

- [Your Name] — [role, e.g. Backend / Admin features]
- [Teammate Name] — [role, e.g. Frontend / Student features]

Built as part of **[Third Space YSWS]**.

---

## 📄 License

*(optional at this stage — add later if needed)*
