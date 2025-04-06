fitness-website/
├── backend/          # Node.js/Express backend
│   ├── config/       # Configuration
│   │   └── db.js     # MongoDB connection
│   ├── models/       # Mongoose schemas
│   │   ├── Gym.js    # Gym (name, location, ownerId, trainers, members, images)
│   │   ├── User.js   # User (email, password, role, gymId)
│   │   ├── Membership.js  # Membership (userId, gymId, startDate, endDate, price)
│   │   ├── DietPlan.js    # Diet plans (userId, meals, macros)
│   │   ├── WorkoutPlan.js # Workout plans (userId, exercises)
│   │   ├── MacroLog.js    # Macro logs (userId, date, food, macros)
│   │   └── BodyProgress.js # Body progress (userId, date, weight, measurements)
│   ├── routes/       # API routes
│   │   ├── auth.js   # Signup/login
│   │   ├── admin.js  # Admin endpoints
│   │   ├── gym.js    # Gym management
│   │   └── user.js   # Customer endpoints
│   ├── middleware/   # Middleware
│   │   └── auth.js   # Auth and role/gym restrictions
│   ├── utils/        # Utilities
│   │   └── email.js  # Email reminders (optional)
│   ├── node_modules/ # Dependencies
│   ├── .env          # Env variables (MONGODB_URI, JWT_SECRET, EMAIL_PASS)
│   ├── .gitignore    # Ignore node_modules, .env
│   ├── package.json  # Dependencies (express, mongoose, jwt, bcrypt, nodemailer)
│   └── server.js     # Main server
├── frontend/         # Vite React frontend
│   ├── public/       # Static assets
│   │   ├── vite.svg  # Default Vite logo (optional)
│   │   └── favicon.ico # Favicon
│   ├── src/          # Source code
│   │   ├── assets/   # Images, etc.
│   │   │   └── logo.png # App logo (optional)
│   │   ├── components/ # Reusable components
│   │   │   ├── Login.jsx  # Login form
│   │   │   ├── Signup.jsx # Signup form
│   │   │   ├── AdminDashboard.jsx # Admin panel
│   │   │   ├── OwnerDashboard.jsx # Owner panel
│   │   │   ├── CustomerDashboard.jsx # Customer panel
│   │   │   ├── GymProfile.jsx # Gym details
│   │   │   ├── MacroTracker.jsx # Macro logging
│   │   │   └── ProgressTracker.jsx # Body progress
│   │   ├── pages/    # Page-level components
│   │   │   ├── Home.jsx # Main page (nearby gyms)
│   │   │   ├── Admin.jsx # Admin route
│   │   │   ├── Owner.jsx # Owner route
│   │   │   └── Customer.jsx # Customer route
│   │   ├── App.jsx   # Main app with routing
│   │   ├── main.jsx  # Vite entry point
│   │   ├── index.css # Global styles (Tailwind)
│   │   └── vite-env.d.ts # TypeScript env (default)
│   ├── node_modules/ # Dependencies
│   ├── .gitignore    # Ignore node_modules, dist
│   ├── package.json  # Dependencies (react, react-dom, axios, react-router-dom, tailwindcss)
│   ├── vite.config.js # Vite configuration
│   ├── tailwind.config.js # Tailwind setup
│   ├── postcss.config.js # PostCSS for Tailwind
│   └── README.md     # Documentation