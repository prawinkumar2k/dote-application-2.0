# Authentication System Architecture

**Date Created:** April 18, 2026  
**Status:** ✅ Complete & Configured  
**Framework:** Express.js + JWT + Bcryptjs

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Authentication Flow](#authentication-flow)
4. [API Endpoints](#api-endpoints)
5. [Routes & Controllers](#routes--controllers)
6. [Middleware](#middleware)
7. [Models (Data Layer)](#models-data-layer)
8. [Security Features](#security-features)
9. [Testing Credentials](#testing-credentials)
10. [Error Handling](#error-handling)

---

## 🏗️ Overview

The application implements a **role-based authentication system** with three user types:

| Role | Login Field | Model | Table | Status |
|------|-------------|-------|-------|--------|
| **Admin** | User ID | User | user_master | ✅ Ready |
| **College** | User ID | Institution | institution_master | ✅ Ready |
| **Student** | Email | Student | student_master | ✅ Ready |

**Key Technologies:**
- **JWT Tokens** - Stateless authentication
- **Bcryptjs** - Password hashing (10 salt rounds)
- **HTTP-Only Cookies** - Secure token storage
- **Role-Based Access Control (RBAC)** - Middleware-based authorization

---

## 🔄 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                       FRONTEND (React + Vite)                   │
│                         Login.jsx                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ POST /api/auth/login                                       │ │
│  │ {identifier, password, role}                               │ │
│  └──────────────────┬─────────────────────────────────────────┘ │
└─────────────────────┼─────────────────────────────────────────────┘
                      │
                      │ HTTP Request via Proxy
                      │
┌─────────────────────▼─────────────────────────────────────────────┐
│                    VITE PROXY SERVER                              │
│  vite.config.js: /api → http://localhost:5000                    │
└─────────────────────┬─────────────────────────────────────────────┘
                      │
                      │ Proxied Request
                      │
┌─────────────────────▼─────────────────────────────────────────────┐
│                   EXPRESS SERVER (5000)                           │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  app.js - Route Mounting                                   │  │
│  │  app.use('/api/auth', authRoutes)                          │  │
│  └──────────────────┬─────────────────────────────────────────┘  │
│                     │                                             │
│  ┌──────────────────▼─────────────────────────────────────────┐  │
│  │  routes/auth.routes.js                                     │  │
│  │  POST /login  → loginController                            │  │
│  │  GET  /logout → logoutController                           │  │
│  └──────────────────┬─────────────────────────────────────────┘  │
│                     │                                             │
│  ┌──────────────────▼─────────────────────────────────────────┐  │
│  │  controllers/auth.controller.js                            │  │
│  │  • login()   - Authenticate & issue JWT                    │  │
│  │  • logout()  - Invalidate token                            │  │
│  │  • Role routing: admin, college, student                   │  │
│  └──────────────────┬─────────────────────────────────────────┘  │
│                     │                                             │
│  ┌──────────────────▼─────────────────────────────────────────┐  │
│  │  models/ (Data Access Layer)                               │  │
│  │  • User.findByUserId(userId)      [Admin]                  │  │
│  │  • Institution.findByUserId()     [College]                │  │
│  │  • Student.findByEmail(email)     [Student]                │  │
│  └──────────────────┬─────────────────────────────────────────┘  │
│                     │                                             │
│  ┌──────────────────▼─────────────────────────────────────────┐  │
│  │  config/db.config.js - MySQL Database                      │  │
│  │  • user_master (admin)                                     │  │
│  │  • institution_master (college)                            │  │
│  │  • student_master (student)                                │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

### Step 1: User Submits Login Form
```
Frontend (Login.jsx)
│
├─ Collects: identifier (email/user_id), password, role
├─ Validates: all fields required
└─ Sends: POST /api/auth/login
```

### Step 2: Request Reaches Backend
```
Vite Proxy → Express Server
│
├─ Route: /api/auth/login (auth.routes.js)
├─ Handler: login() function (auth.controller.js)
└─ Continues: to Step 3
```

### Step 3: Controller Routes by Role
```
login() controller
│
├─ If role='admin'
│  └─ Query: User.findByUserId(identifier)
│     └─ Table: user_master WHERE user_id = ?
│
├─ If role='college'
│  └─ Query: Institution.findByUserId(identifier)
│     └─ Table: institution_master WHERE user_id = ?
│
└─ If role='student'
   └─ Query: Student.findByEmail(identifier)
      └─ Table: student_master WHERE email = ?
```

### Step 4: Password Verification
```
bcrypt.compare(submittedPassword, databaseHash)
│
├─ If match: Continue to Step 5
└─ If no match: Return "Invalid credentials" 401
```

### Step 5: JWT Token Generation
```
jwt.sign({
  id: user.id,
  role: role,
  name: user.name
}, JWT_SECRET, {
  expiresIn: '7d'  // From .env
})
```

### Step 6: Send Response with Cookie
```
Response Status: 200 OK
Response Cookie: 
  - Name: 'token'
  - Value: JWT token
  - httpOnly: true (secure)
  - expires: now + 7 days
  - secure: true (production only)

Response Body:
{
  "success": true,
  "role": "student",
  "user": {
    "id": "STU001",
    "name": "Aman Kumar",
    "role": "student"
  }
}
```

### Step 7: Frontend Stores Token & Redirects
```
✅ Token stored in httpOnly cookie (automatic)
✅ Toast message: "Welcome back, Aman Kumar!"
✅ Redirect: /student/dashboard
```

---

## 📡 API Endpoints

### Login Endpoint

```http
POST /api/auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "identifier": "aman.kumar@email.com",  // or user_id for admin/college
  "password": "Student@123",
  "role": "student"                      // student, college, or admin
}
```

**Successful Response (200):**
```json
{
  "success": true,
  "role": "student",
  "user": {
    "id": "STU001",
    "name": "Aman Kumar",
    "role": "student"
  }
}
```

**Error Response (401):**
```json
{
  "message": "Invalid credentials"
}
```

**Error Response (400):**
```json
{
  "message": "Please provide all details"
}
```

---

### Logout Endpoint

```http
GET /api/auth/logout
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 🛣️ Routes & Controllers

### File: `server/routes/auth.routes.js`

```javascript
const express = require('express');
const { login, logout } = require('../controllers/auth.controller');
const router = express.Router();

router.post('/login', login);      // POST /api/auth/login
router.get('/logout', logout);     // GET /api/auth/logout

module.exports = router;
```

**Mounted in `server/app.js`:**
```javascript
app.use('/api/auth', authRoutes);
```

---

### File: `server/controllers/auth.controller.js`

#### Login Controller

```javascript
const login = async (req, res) => {
  try {
    // 1. Extract credentials
    const { identifier, password, role } = req.body;

    // 2. Validate input
    if (!identifier || !password || !role) {
      return res.status(400).json({ message: 'Please provide all details' });
    }

    // 3. Route by role to correct model
    let user;
    if (role === 'admin') {
      user = await User.findByUserId(identifier);
    } else if (role === 'college') {
      user = await Institution.findByUserId(identifier);
    } else if (role === 'student') {
      user = await Student.findByEmail(identifier);
    }

    // 4. Check if user exists
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 5. Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 6. Create JWT token
    const token = jwt.sign(
      { id: user.id || user.user_id, role: role, name: user.user_name || user.name || user.student_name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    // 7. Set cookie options
    const cookieOptions = {
      expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    };

    // 8. Send response with cookie
    res.status(200).cookie('token', token, cookieOptions).json({
      success: true,
      role: role,
      user: {
        id: user.id || user.user_id,
        name: user.user_name || user.name || user.student_name,
        role: role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
```

#### Logout Controller

```javascript
const logout = (req, res) => {
  // Clear the authentication token by setting it with expired date
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),  // 10 seconds
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};
```

---

## 🔒 Middleware

### File: `server/middleware/auth.middleware.js`

#### Protect Middleware (Authentication)

```javascript
const protect = async (req, res, next) => {
  let token;

  // 1. Look for token in cookies
  if (req.cookies.token) {
    token = req.cookies.token;
  }

  // 2. Check if token exists
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    // 3. Verify JWT signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Attach user info to request
    req.user = decoded;
    
    // 5. Continue to next middleware/controller
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};
```

**Usage in Protected Routes:**
```javascript
router.get('/protected-route', protect, controller);
```

---

#### Authorize Middleware (Authorization)

```javascript
const authorize = (...roles) => {
  return (req, res, next) => {
    // 1. Check if user's role is in allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    // 2. Continue if authorized
    next();
  };
};
```

**Usage in Role-Protected Routes:**
```javascript
router.get(
  '/admin-only', 
  protect,                    // First check authentication
  authorize('admin'),         // Then check role
  controller
);
```

---

## 🗂️ Models (Data Layer)

### File: `server/models/user.model.js` (Admin)

```javascript
const User = {
  findByUserId: async (userId) => {
    const [rows] = await db.query(
      'SELECT * FROM user_master WHERE user_id = ?', 
      [userId]
    );
    return rows[0];
  },

  create: async (userData) => {
    const { user_id, user_name, role, password } = userData;
    const [result] = await db.query(
      'INSERT INTO user_master (user_id, user_name, role, password, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [user_id, user_name, role, password]
    );
    return result.insertId;
  },
};
```

**Database Table: user_master**
```sql
id           INT PRIMARY KEY AUTO_INCREMENT
user_id      VARCHAR(50) UNIQUE (e.g., 'admin_dote')
user_name    VARCHAR(255)
role         VARCHAR(50) (value: 'admin')
password     VARCHAR(255) (bcryptjs hash)
created_at   TIMESTAMP
updated_at   TIMESTAMP
```

---

### File: `server/models/student.model.js` (Student)

```javascript
const Student = {
  findByUserId: async (userId) => {
    const [rows] = await db.query(
      'SELECT * FROM student_master WHERE user_id = ?', 
      [userId]
    );
    return rows[0];
  },

  findByEmail: async (email) => {
    const [rows] = await db.query(
      'SELECT * FROM student_master WHERE email = ?', 
      [email]
    );
    return rows[0];
  },
};
```

**Database Table: student_master**
```sql
id              INT PRIMARY KEY AUTO_INCREMENT
user_id         VARCHAR(50) (e.g., 'STU001')
student_name    VARCHAR(255)
email           VARCHAR(255) UNIQUE (login field)
dob             DATE
age             INT
gender          VARCHAR(10)
mobile          VARCHAR(15)
community       VARCHAR(50)
caste           VARCHAR(50)
role            VARCHAR(50) (value: 'student')
password        VARCHAR(255) (bcryptjs hash)
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

---

### File: `server/models/institution.model.js` (College)

```javascript
const Institution = {
  findByUserId: async (userId) => {
    const [rows] = await db.query(
      'SELECT * FROM institution_master WHERE user_id = ?', 
      [userId]
    );
    return rows[0];
  },
};
```

**Database Table: institution_master**
```sql
id                   INT PRIMARY KEY AUTO_INCREMENT
user_id              VARCHAR(50) UNIQUE (login field)
institution_name     VARCHAR(255)
institution_code     VARCHAR(50)
address              TEXT
contact_person       VARCHAR(255)
contact_phone        VARCHAR(15)
contact_email        VARCHAR(255)
role                 VARCHAR(50) (value: 'college')
password             VARCHAR(255) (bcryptjs hash)
created_at           TIMESTAMP
updated_at           TIMESTAMP
```

---

## 🛡️ Security Features

### 1. Password Hashing

**Algorithm:** Bcryptjs  
**Salt Rounds:** 10  
**Location:** Database storage

```javascript
// When creating user
const hashedPassword = await bcrypt.hash(plainPassword, 10);

// When verifying
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

### 2. JWT Tokens

**Algorithm:** HS256 (HMAC SHA-256)  
**Payload:**
```json
{
  "id": "STU001",
  "role": "student",
  "name": "Aman Kumar",
  "iat": 1713434400,
  "exp": 1713520800
}
```

**Storage:** HTTP-Only Cookie (cannot be accessed by JavaScript)

### 3. HTTP-Only Cookies

**Prevents:**
- XSS (Cross-Site Scripting) attacks
- Token theft via JavaScript
- Accidental exposure in console logs

**Set-Cookie Header:**
```
Set-Cookie: token=jwtvalue123; HttpOnly; Path=/; Max-Age=604800; Secure;
```

### 4. CORS Configuration

**Location:** `server/app.js`
```javascript
app.use(cors({
  origin: 'http://localhost:5173',  // Vite dev server
  credentials: true                 // Allow cookies
}));
```

### 5. Role-Based Access Control (RBAC)

**Middleware Protection:**
```javascript
// Protect admin routes
router.get('/admin/data', protect, authorize('admin'), controller);

// Protect student routes
router.get('/student/applications', protect, authorize('student'), controller);
```

---

## 🧪 Testing Credentials

### All 6 Student Accounts

```
1. Email: aman.kumar@email.com
   Password: Student@123
   Name: Aman Kumar

2. Email: priya.singh@email.com
   Password: Student@123
   Name: Priya Singh

3. Email: rahul.patel@email.com
   Password: Student@123
   Name: Rahul Patel

4. Email: neha.gupta@email.com
   Password: Student@123
   Name: Neha Gupta

5. Email: arjun.verma@email.com
   Password: Student@123
   Name: Arjun Verma

6. Email: divya.sharma@email.com
   Password: Student@123
   Name: Divya Sharma
```

### Admin Account

```
User ID: admin_dote
Password: Admin@12345
Name: Portal Admin
```

---

## ⚠️ Error Handling

### Status Codes Used

| Code | Scenario | Message |
|------|----------|---------|
| 200 | Login success | success: true |
| 400 | Missing fields | "Please provide all details" |
| 401 | Wrong credentials | "Invalid credentials" |
| 401 | No token | "Not authorized, no token" |
| 401 | Invalid token | "Not authorized, token failed" |
| 403 | Wrong role | "User role X is not authorized..." |
| 500 | Server error | "Server error" |

---

## 📝 Configuration (.env)

**Required Environment Variables:**

```env
# JWT Configuration
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
COOKIE_EXPIRE=7

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=dote_db

# Environment
NODE_ENV=development
PORT=5000
```

---

## ✅ Complete Feature Checklist

- [x] Login route created (`/api/auth/login`)
- [x] Logout route created (`/api/auth/logout`)
- [x] Login controller with multi-role support
- [x] Logout controller
- [x] Protect middleware (authentication)
- [x] Authorize middleware (authorization)
- [x] Admin login (User model)
- [x] College login (Institution model)
- [x] Student login with email (Student model)
- [x] JWT token generation
- [x] HTTP-Only cookie storage
- [x] Password hashing with Bcryptjs
- [x] CORS configuration
- [x] 6 student test accounts created
- [x] 1 admin test account available
- [x] Error handling for all scenarios
- [x] Role-based routing in controller

---

## 🚀 Example: Using Middleware in New Routes

### Protected Admin Route

```javascript
// routes/admin.routes.js
const express = require('express');
const { protect, authorize } = require('../middleware/auth.middleware');
const { getDashboard } = require('../controllers/admin.controller');

const router = express.Router();

// This route is protected: requires authentication + admin role
router.get('/dashboard', protect, authorize('admin'), getDashboard);

module.exports = router;
```

### Protected Student Route

```javascript
// routes/student.routes.js
const express = require('express');
const { protect, authorize } = require('../middleware/auth.middleware');
const { getApplications } = require('../controllers/student.controller');

const router = express.Router();

// This route is protected: requires authentication + student role
router.get('/applications', protect, authorize('student'), getApplications);

module.exports = router;
```

---

## 📞 Support

**Common Issues:**

1. **"Invalid credentials"**
   - Verify email/user_id exists in database
   - Check password is correct
   - Verify role matches user type

2. **"Not authorized, no token"**
   - Login first to get token
   - Check cookies are enabled in browser
   - Clear browser cache and retry

3. **"User role X is not authorized"**
   - Ensure route is using correct roles in authorize()
   - Verify user's actual role in database

---

**Last Updated:** April 18, 2026  
**Version:** 1.0.0  
**Status:** Production Ready ✅
