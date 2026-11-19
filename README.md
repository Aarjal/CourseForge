<p align="center">
  <img src="client/public/favicon.png" alt="CourseForge logo" width="120"/>
</p>

<h1 align="center">CourseForge</h1>
<p align="center"><i>An E-learning platform for enthusiastic learners with practical, structured courses.</i></p>

---

## Current Status

CourseForge is in active development. The frontend currently operates as a standalone demo running on browser `localStorage` (deployed on GitHub Pages). The Express + MongoDB backend exists with foundational models and routes, and is being prepared for end-to-end integration.

---

## About CourseForge

CourseForge is a full-stack e-learning web application where:
- **Instructors / Admins** can structure and publish courses organized into chapters and learning materials.
- **Students** can browse courses, enroll, access public previews and unlocked lessons, and track their learning progress.

---

## App Features

### Student Side (Current Demo)
- Demo login with mock credentials
- Browse available course catalog
- Search courses by title
- View course details and chapter outlines
- One-click course enrollment (persisted in `localStorage`)
- Preview public chapters before enrolling; access unlocked lessons once enrolled
- Mark chapters as complete and track course completion percentages
- Take an interactive knowledge check quiz

### Admin Side (Current Demo)
- Create courses with title, category, level, description, and published status
- Add chapters to existing courses or new course drafts
- Toggle chapter public preview flags
- Save courses and chapters to browser storage

### Planned Features
- Full JWT authentication with separate `student` and `admin` roles
- Real database persistence via MongoDB & Mongoose
- Enforced role and locked-content security on the server
- Study material file uploads via Cloudinary
- Real payment / enrollment integration
- Multi-quiz management per course
- Cloud deployment on Render (server) and Vercel (client)

---

## Tech Stack

- **Frontend**: React 19, Vite 8
- **Backend**: Node.js, Express 5, Mongoose 9
- **Database**: MongoDB Atlas
- **File Storage**: Cloudinary *(planned)*
- **Authentication**: JWT & bcrypt *(in progress)*
- **Deployment**: GitHub Pages *(current client demo)*, Render + Vercel *(planned)*

---

## Some Glimpses

<img width="857" height="766" alt="CourseForge Dashboard" src="https://github.com/user-attachments/assets/81780ffc-2318-4abb-8dc3-837d96b791d3" />
<img width="1244" height="775" alt="Course Catalog" src="https://github.com/user-attachments/assets/0ab5c3f9-3e3f-4e0d-8dc9-fbd839143d2b" />
<img width="1352" height="776" alt="Course Details" src="https://github.com/user-attachments/assets/9dd9e7d0-c985-474c-a9fb-f73ca85bbc66" />
<img width="1333" height="786" alt="Admin Course Builder" src="https://github.com/user-attachments/assets/e2bdde94-2508-411d-a249-53afe822ce55" />

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm
- MongoDB Atlas account or local MongoDB instance

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Aarjal/CourseForge.git
cd CourseForge

# 2. Install client dependencies
cd client
npm install

# 3. Install server dependencies
cd ../server
npm install
```

### Environment Setup

Create `.env` files from their respective templates:

```bash
# In client/
cd ../client
cp .env.example .env

# In server/
cd ../server
cp .env.example .env
```

Edit `server/.env` to configure your MongoDB connection string (`MONGO_URI`) and port if needed:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
CLIENT_ORIGIN=http://localhost:5173,http://localhost:5174,https://aarjal.github.io
```

### Running Locally

Run client and server in separate terminal windows:

```bash
# Start the frontend dev server (from client/ directory)
cd client
npm run dev
# Accessible at http://localhost:5173/CourseForge/

# Start the backend dev server (from server/ directory)
cd server
npm run dev
# Accessible at http://localhost:5000
```

---

## Live Demo
[Open GitHub Pages Demo](https://aarjal.github.io/CourseForge/)  
*(The current demo uses `localStorage`; course data is saved within your active browser).*

---

Built as part of **[Thirdspace YSWS]** with great love and effort :)
