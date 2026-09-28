<p align="center">
  <img src="client/public/favicon.png" alt="CourseForge logo" width="120"/>
</p>

<h1 align="center">CourseForge</h1>
<p align="center"><i>An E-learning platform for enthusiastic learners with every resource and services they'd ever seek. </i></p>

---
<p>
<p>
<p>
  
## Current Status

We're still in building phase as this is the second week of development. The groundwork for the application is there but there's yet to add lots and lots of functionality. First week was all frontend and static things but now we've added the backend part and polished frontend even better. User authentication, however is still remaining(student and admins aren't separated). Simple general workflow to test is still possible with the current version. The UI/UX isn't there yet indeed but for now we're just happy with how it works.
The login page is just a demo version for now--  
You may use demo email and password :)

Currently it has a working frontend demo. Students can login browse and search courses,open course details,enroll in courses,complete chapters and track progress. The app currently uses local storage for demo data. The express and mongodb backend has been started, but the frontend is not connected with backend yet. Auth, file uploads and full admin permissions are planned for later development. 

---
<p>
<p>
<p>
  
## About CourseForge

CourseForge is a full-stack web application where-

--admins can build and design any structured courses out of respective chapters and learning materials.  
--students can browse, enroll, work through the available content at their own pace.

And ideally later on..
  The courses will be organized and structured into different chapters, with individual places of content like( docs, recorded lectures etc.) which will be LOCKED until a student enrolls. After enrollment, the student can access their unlocked course materials, complete different quizzes of their choice and most importantly track their progress as they move through it. Admins will be able to manage the full lifecycle on their end (creating and editing courses, uploading study materials and reviewing who have enrolled).

---
<p>
<p>
<p>
  
## App Features

**Student side**
- login wth demo credentials 
-  Browse through the available courses  
-  search for courses
-  view course details and chapters 
-  Enroll via payment flow  
-  Access their unlocked contents  
-  Take quizzes on topics of their choice  
-  Track their progress  

**Admin side**
-  Create demo courses 
-  add chapters to a course 
-  save data in local storage
-  choose wether chapter is public preview or not

**Planned features**
- real authentication
- mongodb persistence
- file uploads
- payment enrollment
- quiz management


---
<p>
<p>
<p>
  
## Tech Stack

- React with Vite - Frontend
- Node JS with Express - Backend 
- MongoDB with Mongoose - Database
- Cloudinary - File storage (planning)
- JWT - Authentication (planning)
- Vercel and Render - Deployment (planning) { for now - github pages}
- mongodb with mongoose - planned for database  

Note: Backend is fully functional but not yet deployed — currently runs locally ( thats soon to happen )
---
<p>
<p>
<p>
  
## Some Glimpses
<img width="857" height="766" alt="Screenshot 2026-09-21 at 12 45 44 AM" src="https://github.com/user-attachments/assets/81780ffc-2318-4abb-8dc3-837d96b791d3" />
<img width="1244" height="775" alt="Screenshot 2026-09-21 at 12 46 22 AM" src="https://github.com/user-attachments/assets/0ab5c3f9-3e3f-4e0d-8dc9-fbd839143d2b" />
<img width="1352" height="776" alt="Screenshot 2026-09-21 at 12 46 39 AM" src="https://github.com/user-attachments/assets/9dd9e7d0-c985-474c-a9fb-f73ca85bbc66" />
<img width="1333" height="786" alt="Screenshot 2026-09-21 at 12 47 05 AM" src="https://github.com/user-attachments/assets/e2bdde94-2508-411d-a249-53afe822ce55" />



---
<p>
<p>
<p>
  
## Getting Started


### Prerequisites
- Node js
- Mongodb connection
- npm
- node.js 18 or newer
- npm

### Installation

```bash
# To clone the repo
git clone https://github.com/Aarjal/CourseForge.git
cd courseforge

# To install frontend dependencies
cd ../client
npm install

#To install backend dependencies
cd server
npm install
```

```bash
git clone https://github.com/Aarjal/CourseForge.git
cd CourseForge/client
npm install

### Running locally

```bash

# To start frontend 
cd client
npm start
```



## live demo:
[open this link to see demo](https://aarjal.github.io/CourseForge/)
current demo uses local storage , so course data is saved only in browser being used for now. 

---
<p>
<p>
<p>
  
Built as part of **[Thirdspace YSWS]** with great love and effort :)

