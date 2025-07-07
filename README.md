# Learnify  – Personalized Learning Path Generator

Learnify is an AI-powered full-stack web application that generates customized career learning paths for users based on their selected goals — such as becoming a Full-Stack Developer, Data Scientist, or ML Engineer. This system helps learners progress step-by-step with curated modules, resources, and progress tracking.



 Features :

- ✅ User Authentication (Register/Login with JWT)
- ✅ Role Selection (e.g., Backend Dev, Data Scientist)
- ✅ Personalized Learning Path Generation
- ✅ Track Progress of Each Module
- ✅ Resource Links for Each Step
- ✅ Persistent State with JWT & Backend Storage
- ✅ Fully responsive UI





| Frontend              | Backend                | Database     |
|-----------------------|------------------------|--------------|
| React.js  | Node.js + Express       | MongoDB Atlas |

Other tools:  
- JWT Authentication  
- Axios for API Calls  
- React Router DOM  
- Hosted on Railway.app 


 Authentication Flow

1. User registers and gets a JWT token.
2. After login, the app checks if the user has already selected a goal:
   - If yes, redirect to `/dashboard`
   - If no, redirect to `/select-role`
3. User selects a role → system generates a custom path via API.
4. Dashboard shows progress, modules, and links.


# Clone the repo
git clone https://github.com/your-username/learnify.git
cd learnify

# Install frontend dependencies
cd frontend
npm install
npm start

# Install backend dependencies
cd ../backend
npm install
npm run dev
