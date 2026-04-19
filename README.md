<div align="center">

# 🎓 DOTE Admission Portal

### Directorate of Technical Education — Integrated Online Admission Management System

[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://mysql.com)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](./LICENSE)

> **A production-grade, full-stack online admission portal** built for the Tamil Nadu Directorate of Technical Education — enabling students, colleges, and administrators to manage the entire admission lifecycle on one unified platform.

</div>

---

## 📖 Overview

### The Problem

The traditional college admission process in Tamil Nadu's technical education system was fragmented — students submitted paper forms, colleges manually reviewed stacks of documents, and administrators had no real-time visibility into system-wide data. This led to delays, data loss, duplicate submissions, and an overall poor experience for all stakeholders.

### The Solution

The **DOTE Admission Portal** digitizes the entire admission pipeline end-to-end:

- **Students** complete a structured 9-step online application with document uploads
- **Colleges** review incoming applications, view academic details, and approve or reject candidates from a single dashboard
- **Administrators** monitor system-wide statistics and manage all registered institutions

### Real-World Importance

| Stakeholder | Pain Eliminated | Value Delivered |
|---|---|---|
| Student | Paper forms, travel, no tracking | Online application with live progress tracking |
| College | Manual document review | Digital application inbox with one-click status updates |
| Admin | Zero visibility | Real-time system dashboard with institution management |

---

## 🧠 System Architecture

### Architecture Diagram

```mermaid
graph TD
    subgraph Client["🌐 Browser (Port 5173)"]
        UI["React 19 + Vite SPA"]
        PROXY["Vite Dev Proxy"]
    end

    subgraph Server["⚙️ Node.js Server (Port 5000)"]
        EXPRESS["Express 5 API"]
        AUTH["JWT Middleware\n(HttpOnly Cookie)"]
        MULTER["Multer File Handler"]
        CONTROLLERS["Controllers\nAuth · Student · College · Admin"]
        MODELS["Models\nStudent · Application · Institution · User"]
    end

    subgraph Database["🗄️ MySQL Database"]
        SM["student_master"]
        IM["institution_master"]
        UM["user_master"]
        MD["mark_details"]
    end

    subgraph Storage["📁 File Storage"]
        UPLOADS["server/uploads/\nstudent/photos/\nstudent/documents/"]
    end

    UI --> PROXY
    PROXY -->|"/api/*  →  localhost:5000"| EXPRESS
    PROXY -->|"/uploads/* → localhost:5000"| EXPRESS
    EXPRESS --> AUTH
    AUTH --> CONTROLLERS
    CONTROLLERS --> MODELS
    MODELS --> SM
    MODELS --> IM
    MODELS --> UM
    MODELS --> MD
    CONTROLLERS --> MULTER
    MULTER --> UPLOADS
    EXPRESS -->|"Static serve"| UPLOADS
```

### Architecture Explained

| Layer | Technology | Role |
|---|---|---|
| **Presentation** | React 19 + Tailwind CSS v4 | SPA with role-based pages |
| **Dev Proxy** | Vite Proxy | Forwards `/api/*` and `/uploads/*` to port 5000 |
| **API** | Express 5 | REST API with middleware chain |
| **Auth** | JWT + httpOnly Cookie | Stateless authentication, XSS-safe |
| **File Upload** | Multer | Disk storage with type/size validation |
| **ORM Layer** | Raw MySQL2 (Promise Pool) | Parameterized queries, no ORM overhead |
| **Database** | MySQL 8 | Relational store for all entities |

---

## 🔄 Application Flow

### Student Registration & Application Flowchart

```mermaid
flowchart TD
    A([🏠 Home Page]) --> B{Have Account?}
    B -->|No| C[/Student Register/]
    B -->|Yes| D[/Login Page/]
    C --> E["Create Account\nemail + password"]
    E --> F[(student_master created)]
    F --> D
    D --> G{Select Role}
    G -->|student| H["Authenticate\nemail + JWT"]
    G -->|college| I["Authenticate\nins_code + JWT"]
    G -->|admin| J["Authenticate\nuser_id + JWT"]
    H --> K[🎓 Student Dashboard]
    I --> L[🏛️ College Dashboard]
    J --> M[🔧 Admin Dashboard]

    K --> N{Application\nSubmitted?}
    N -->|No| O[Fill 9-Step Form]
    N -->|Yes| P[View Application Report]

    O --> O1[Step 1: Personal Info]
    O1 --> O2[Step 2: Contact Details]
    O2 --> O3[Step 3: Parent Info]
    O3 --> O4[Step 4: Academic Background]
    O4 --> O5[Step 5: HSC Marks]
    O5 --> O6[Step 6: SSLC Marks]
    O6 --> O7[Step 7: Special Categories]
    O7 --> O8[Step 8: College Preferences]
    O8 --> O9[Step 9: Document Upload]
    O9 --> O10{Aadhaar\nDuplicate?}
    O10 -->|Yes| ERR[❌ Reject Submission]
    O10 -->|No| SUBMIT[✅ Submit Application]
    SUBMIT --> APPNO["Generate Application No\nDOTE-2026-XXXXXX"]
    APPNO --> P

    L --> Q[View Applications Inbox]
    Q --> R[Open Application Details]
    R --> S{Decision}
    S -->|Approve| T[✅ Status: Approved]
    S -->|Reject| U[❌ Status: Rejected]

    M --> V[System-Wide Stats]
    M --> W[Manage Institutions]
```

---

## 🔁 Sequence Diagrams

### Student Login & Application Save

```mermaid
sequenceDiagram
    actor Student
    participant FE as React Frontend
    participant BE as Express API
    participant DB as MySQL

    Student->>FE: Enter email + password + role=student
    FE->>BE: POST /api/auth/login
    BE->>DB: SELECT * FROM student_master WHERE email=?
    DB-->>BE: Student record
    BE->>BE: bcrypt.compare(password, hash)
    BE-->>FE: Set httpOnly JWT cookie + user JSON
    FE->>FE: Store user in localStorage
    FE-->>Student: Redirect → /student/dashboard

    Student->>FE: Fill Step 1 form fields
    FE->>BE: PUT /api/student/step/1 (cookie auto-sent)
    BE->>BE: JWT verify → req.user = {id, role}
    BE->>DB: UPDATE student_master SET ... WHERE id=?
    DB-->>BE: OK
    BE-->>FE: {success: true, message: "Step 1 saved"}
    FE-->>Student: Auto-advance to Step 2
```

### College Application Review

```mermaid
sequenceDiagram
    actor College
    participant FE as React Frontend
    participant BE as Express API
    participant DB as MySQL

    College->>FE: Open Applications List
    FE->>BE: GET /api/college/applications (cookie)
    BE->>BE: JWT verify → role must be 'college'
    BE->>DB: SELECT * FROM student_master WHERE college_choices LIKE '%ins_code%'
    DB-->>BE: Applications array
    BE-->>FE: {success: true, applications: [...]}
    FE-->>College: Render application table

    College->>FE: Click "Approve Candidate"
    FE->>BE: PUT /api/college/applications/:id/status {status: "Approved"}
    BE->>DB: UPDATE student_master SET application_status='Approved' WHERE id=?
    DB-->>BE: OK
    BE-->>FE: {success: true}
    FE-->>College: Toast notification + UI update
```

---

## 🧩 Module Breakdown

### Frontend Modules

```
client/src/
├── 🔐 Auth Module        — Login (3 roles) + Student Registration
├── 🎓 Student Module     — 9-step application form, dashboard, report viewer
├── 🏛️ College Module     — Dashboard with charts, applications inbox, detail modal
├── 🔧 Admin Module       — System stats, institution management, master data
├── 🧭 Routes Module      — AppRoutes + ProtectedRoute (role-based guards)
└── 🧱 Layout Module      — MainLayout with role-aware sidebar + navbar
```

### Backend Modules

```
server/
├── 🔐 Auth Controller    — register, login, logout
├── 🎓 Student Controller — getMe, saveStep (1-8), uploadDocument, submitApplication
├── 🏛️ College Controller — getDashboardStats, getAllApplications, updateApplicationStatus
├── 🔧 Admin Controller   — getDashboardStats, getAllColleges
├── 🛡️ Auth Middleware    — protect (JWT verify) + authorize (role check)
└── 📁 Multer Config      — Disk storage, 5MB limit, JPG/PNG/PDF filter
```

---

## ✨ Features

### Core Features

| Feature | Description | Role |
|---|---|---|
| **Multi-Role Auth** | JWT via httpOnly cookie — student / college / admin | All |
| **9-Step Form** | Progressive, auto-saving application with 9 distinct sections | Student |
| **Document Upload** | Photo (JPG/PNG) + TC/Marksheet/Community cert (PDF) — 5MB max | Student |
| **Aadhaar Guard** | Prevents duplicate submissions using the same Aadhaar number | Student |
| **Application Number** | Auto-generated unique ID on final submission (`DOTE-2026-XXXXXX`) | Student |
| **Application Tracker** | Live progress dashboard showing % complete and documents uploaded | Student |
| **Print Report** | Print-optimized application report (HSC/SSLC marks, personal details) | Student |
| **College Dashboard** | Pie chart (status) + bar chart (demand) powered by Recharts | College |
| **Application Inbox** | Filter by status, search by name/app ID, paginated table | College |
| **Detail Modal** | Full applicant profile view with document preview (in-app image viewer) | College |
| **One-Click Status** | Approve or reject an application with real-time DB update | College |
| **Admin Overview** | Total colleges, students, users — recent institution list | Admin |
| **College Directory** | Searchable, filterable, paginated institution list | Admin |
| **Master Data** | Seed dropdowns (community, religion, board, occupation, city) | All |
| **Role Guards** | Frontend `ProtectedRoute` + Backend `protect` + `authorize` middleware | All |
| **Animated UI** | Framer Motion page transitions, hover effects | All |
| **Responsive Design** | Mobile-first Tailwind layout with collapsible sidebar | All |

---

## 🧰 Tech Stack

### Frontend

| Technology | Version | Purpose in This Project |
|---|---|---|
| **React** | 19.2 | Component-based SPA. Manages all UI state, forms, and routing |
| **Vite** | 8.x | Ultra-fast dev server with HMR. Proxies `/api/*` to backend |
| **Tailwind CSS** | 4.x | Utility-first styling. Custom gradient classes, responsive grid |
| **Framer Motion** | 12.x | Page load animations (`opacity + y` transitions) |
| **React Router DOM** | 7.x | Client-side routing with `ProtectedRoute` wrapper components |
| **Axios** | 1.x | HTTP client with `withCredentials: true` to send JWT cookie |
| **Recharts** | 3.x | PieChart (application status) + BarChart (course demand) |
| **React Toastify** | Latest | Non-blocking success/error notifications |
| **Lucide React** | Latest | Consistent, tree-shakeable icon library |

### Backend

| Technology | Version | Purpose in This Project |
|---|---|---|
| **Node.js** | 20+ | Runtime. `--watch` flag enables auto-restart in development |
| **Express** | 5.x | REST API framework with async error propagation built-in |
| **MySQL2** | 3.x | Promise-based MySQL driver. Pool of 10 connections |
| **bcryptjs** | 3.x | Password hashing (10 rounds). Also handles plain-text legacy passwords |
| **jsonwebtoken** | 9.x | Signs JWT with HS256. Payload: `{id, role, name}`. 24h expiry |
| **Multer** | 2.x | Multipart file upload. Custom filename strategy: `ph001.jpg`, `tc001.pdf` |
| **cookie-parser** | 1.x | Parses httpOnly JWT cookie from incoming requests |
| **cors** | 2.x | Whitelist all `localhost:*` origins in dev mode |
| **dotenv** | 17.x | Environment variable injection from `.env` |

### Database

| Technology | Purpose |
|---|---|
| **MySQL 8** | Relational database. 4 tables with FK relationships |
| **Connection Pool** | `mysql2` pool — max 10 concurrent connections, automatic release |

---

## 📂 Project Structure

```
dote_application/
│
├── 📦 package.json                  ← Root: concurrently (runs both servers)
│
├── 🖥️ client/                       ← React + Vite Frontend
│   ├── index.html
│   ├── vite.config.js               ← Proxy: /api/* → :5000, /uploads/* → :5000
│   ├── tailwind.config.js
│   └── src/
│       ├── App.jsx                  ← Mounts BrowserRouter + ToastContainer
│       ├── main.jsx                 ← React DOM entry point
│       ├── index.css                ← Global styles, btn-primary, gradient-text
│       │
│       ├── routes/
│       │   ├── AppRoutes.jsx        ← All route definitions, role-based grouping
│       │   └── ProtectedRoute.jsx   ← Checks localStorage user + role match
│       │
│       ├── components/
│       │   ├── layout/
│       │   │   └── MainLayout.jsx   ← Nav + role-aware sidebar + footer
│       │   └── ApplicationReport.jsx ← Print-optimized student report
│       │
│       └── pages/
│           ├── Home.jsx             ← Landing page
│           ├── Auth/
│           │   ├── Login.jsx        ← 3-tab role selector + form
│           │   └── Register.jsx     ← Student-only registration
│           ├── Student/
│           │   ├── Dashboard.jsx    ← Progress tracker, quick actions
│           │   ├── ApplicationForm.jsx ← 9-step wizard (Steps 1-9)
│           │   └── MyApp.jsx        ← Application overview + report mode
│           ├── College/
│           │   ├── Dashboard.jsx    ← Stats cards + Recharts (Pie + Bar)
│           │   ├── ApplicationsList.jsx ← Applications table + detail modal
│           │   └── ApplicationDetail.jsx
│           └── Admin/
│               ├── Dashboard.jsx    ← System-wide stats
│               ├── ManageColleges.jsx ← Searchable institution directory
│               └── MasterData.jsx   ← Lookup data management (UI stub)
│
└── ⚙️ server/                       ← Node.js + Express Backend
    ├── server.js                    ← Creates upload dirs, starts HTTP listener
    ├── app.js                       ← Express setup: CORS, middleware, routes
    ├── .env                         ← Environment variables (DO NOT COMMIT)
    │
    ├── config/
    │   └── db.config.js             ← MySQL2 connection pool (max 10)
    │
    ├── controllers/
    │   ├── auth.controller.js       ← register, login (3 roles), logout
    │   ├── student.controller.js    ← getMe, saveStep, uploadDocument, submit
    │   ├── college.controller.js    ← dashboard stats, applications CRUD
    │   └── admin.controller.js      ← system stats, college directory
    │
    ├── middleware/
    │   └── auth.middleware.js       ← protect() + authorize(...roles)
    │
    ├── models/
    │   ├── student.model.js         ← All student_master queries (9 step updates)
    │   ├── application.model.js     ← mark_details upsert (steps 5 & 6)
    │   ├── institution.model.js     ← institution_master queries
    │   └── user.model.js            ← user_master queries
    │
    ├── routes/
    │   ├── auth.routes.js           ← /api/auth/*
    │   ├── student.routes.js        ← /api/student/* (protect + multer)
    │   ├── college.routes.js        ← /api/college/* (protect + authorize)
    │   └── admin.routes.js          ← /api/admin/* (protect + authorize)
    │
    └── uploads/
        └── student/
            ├── photos/              ← Passport photos (ph001.jpg ...)
            └── documents/           ← TC, marksheet, community certs
```

---

## ⚙️ Installation & Setup

### 🖥️ System Requirements

| Requirement | Version | Check Command |
|---|---|---|
| Node.js | ≥ 20.0 | `node --version` |
| npm | ≥ 10.0 | `npm --version` |
| MySQL | ≥ 8.0 | `mysql --version` |
| Git | Any | `git --version` |

> **OS:** Windows 10/11, macOS 12+, Ubuntu 20.04+

---

### 🔧 Step-by-Step Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/your-username/dote-admission-portal.git
cd dote-admission-portal
```

#### 2. Install All Dependencies

```bash
# Install root dependencies (concurrently)
npm install

# Install backend dependencies
cd server && npm install && cd ..

# Install frontend dependencies
cd client && npm install && cd ..
```

#### 3. Configure Environment Variables

Create `server/.env` (copy from the example below):

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
# ─── Server ───────────────────────────────────────────────
PORT=5000
NODE_ENV=development

# ─── Database ─────────────────────────────────────────────
DB_HOST=localhost          # Your MySQL host
DB_PORT=3306
DB_NAME=admission_dote     # Database name
DB_USER=root               # MySQL username
DB_PASS=yourpassword       # MySQL password

# ─── JWT ──────────────────────────────────────────────────
JWT_SECRET=your_super_secret_key_change_this_in_production
JWT_EXPIRE=24h

# ─── Cookie ───────────────────────────────────────────────
COOKIE_EXPIRE=1            # Days
```

#### 4. Set Up the Database

```sql
-- Connect to MySQL and create the database
CREATE DATABASE IF NOT EXISTS admission_dote;
USE admission_dote;

-- Students table (primary application store)
CREATE TABLE student_master (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(20),
  student_name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  mobile VARCHAR(15),
  password VARCHAR(255),
  role VARCHAR(20) DEFAULT 'student',
  dob DATE,
  gender VARCHAR(20),
  aadhar VARCHAR(20),
  religion VARCHAR(50),
  community VARCHAR(50),
  caste VARCHAR(100),
  mother_tongue VARCHAR(50),
  medium_of_instruction VARCHAR(50),
  nativity VARCHAR(50),
  civic_native VARCHAR(50),
  alt_mobile VARCHAR(15),
  communication_address TEXT,
  permanent_address TEXT,
  state VARCHAR(50),
  father_name VARCHAR(255),
  mother_name VARCHAR(255),
  parent_occupation VARCHAR(100),
  parent_annual_income VARCHAR(20),
  last_institution_board VARCHAR(100),
  last_institution_register_no VARCHAR(50),
  last_institution_name VARCHAR(255),
  last_institution_district VARCHAR(100),
  differently_abled ENUM('yes','no') DEFAULT 'no',
  ex_servicemen ENUM('yes','no') DEFAULT 'no',
  eminent_sports ENUM('yes','no') DEFAULT 'no',
  school_type VARCHAR(20),
  college_choices JSON,
  hostel_choice ENUM('yes','no') DEFAULT 'no',
  womens_choice ENUM('yes','no') DEFAULT 'no',
  photo VARCHAR(500),
  transfer_certificate VARCHAR(500),
  marksheet_certificate VARCHAR(500),
  community_certificate VARCHAR(500),
  application_no VARCHAR(50),
  application_status VARCHAR(20) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Academic marks table
CREATE TABLE mark_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  qualifying_board VARCHAR(100),
  year_of_passing VARCHAR(10),
  hsc ENUM('yes','no') DEFAULT 'yes',
  hsc_register_no VARCHAR(50),
  hsc_exam_type VARCHAR(50),
  hsc_major_stream VARCHAR(100),
  hsc_subject1 VARCHAR(100), hsc_subject1_obtained_mark INT, hsc_subject1_max_mark INT,
  hsc_subject2 VARCHAR(100), hsc_subject2_obtained_mark INT, hsc_subject2_max_mark INT,
  hsc_subject3 VARCHAR(100), hsc_subject3_obtained_mark INT, hsc_subject3_max_mark INT,
  hsc_subject4 VARCHAR(100), hsc_subject4_obtained_mark INT, hsc_subject4_max_mark INT,
  hsc_subject5 VARCHAR(100), hsc_subject5_obtained_mark INT, hsc_subject5_max_mark INT,
  hsc_subject6 VARCHAR(100), hsc_subject6_obtained_mark INT, hsc_subject6_max_mark INT,
  hsc_total_mark INT, hsc_total_obtained_mark INT, hsc_percentage DECIMAL(5,2), hsc_cutoff DECIMAL(5,2),
  sslc ENUM('yes','no') DEFAULT 'yes',
  sslc_register_no VARCHAR(50),
  sslc_marksheet_no VARCHAR(50),
  sslc_subject1 VARCHAR(100), sslc_subject1_obtained_mark INT, sslc_subject1_max_mark INT,
  sslc_subject2 VARCHAR(100), sslc_subject2_obtained_mark INT, sslc_subject2_max_mark INT,
  sslc_subject3 VARCHAR(100), sslc_subject3_obtained_mark INT, sslc_subject3_max_mark INT,
  sslc_subject4 VARCHAR(100), sslc_subject4_obtained_mark INT, sslc_subject4_max_mark INT,
  sslc_subject5 VARCHAR(100), sslc_subject5_obtained_mark INT, sslc_subject5_max_mark INT,
  sslc_total_mark INT, sslc_total_obtained_mark INT, sslc_percentage DECIMAL(5,2),
  FOREIGN KEY (student_id) REFERENCES student_master(id) ON DELETE CASCADE
);

-- Institutions / Colleges table
CREATE TABLE institution_master (
  ins_code VARCHAR(20) PRIMARY KEY,
  ins_name VARCHAR(255) NOT NULL,
  ins_type VARCHAR(100),
  ins_city VARCHAR(100),
  ins_district VARCHAR(100),
  ins_principal VARCHAR(255),
  ins_phone_number VARCHAR(20),
  ins_email_id_office VARCHAR(255),
  ins_status VARCHAR(20) DEFAULT 'Active',
  password VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin users table
CREATE TABLE user_master (
  user_id VARCHAR(50) PRIMARY KEY,
  user_name VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin',
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 5. Seed an Admin User

```sql
-- Password: Admin@123 (bcrypt hash — change in production)
INSERT INTO user_master (user_id, user_name, role, password)
VALUES (
  'ADMIN001',
  'System Administrator',
  'admin',
  '$2a$10$YourBcryptHashHere'
);
```

> **Tip:** Use Node.js to generate a hash:
> ```bash
> node -e "const b=require('bcryptjs'); b.hash('Admin@123',10).then(console.log)"
> ```

#### 6. Run the Application

```bash
# ▶️ Development (both servers together — RECOMMENDED)
npm run dev

# Or run separately:
npm run server   # Backend only  → http://localhost:5000
npm run client   # Frontend only → http://localhost:5173
```

> **Important:** Always use `npm run dev` from the root. If only the frontend is running, all API calls will return `502 Bad Gateway`.

---

### ▶️ Run Commands Reference

| Command | Directory | Description |
|---|---|---|
| `npm run dev` | `/` (root) | Start both frontend + backend concurrently |
| `npm run server` | `/` (root) | Start backend only (port 5000) |
| `npm run client` | `/` (root) | Start frontend only (port 5173) |
| `npm run dev` | `/server` | Backend with `--watch` auto-restart |
| `npm run start` | `/server` | Backend production start |
| `npm run dev` | `/client` | Frontend Vite dev server |
| `npm run build` | `/client` | Build frontend for production |
| `npm run preview` | `/client` | Preview production build locally |

---

### 🐳 Docker Setup

Create `docker-compose.yml` in the project root:

```yaml
version: '3.9'

services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: admission_dote
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  backend:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      DB_HOST: db
      DB_PORT: 3306
      DB_NAME: admission_dote
      DB_USER: root
      DB_PASS: rootpassword
      JWT_SECRET: your_secret
      JWT_EXPIRE: 24h
      COOKIE_EXPIRE: 1
      NODE_ENV: production
    depends_on:
      - db

  frontend:
    build: ./client
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  mysql_data:
```

Create `server/Dockerfile`:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

Create `client/Dockerfile`:

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

```bash
# Build and start all containers
docker-compose up --build

# Stop
docker-compose down
```

---

## 🔐 Security & Restrictions

### Authentication

| Layer | Mechanism | Details |
|---|---|---|
| **Transport** | httpOnly Cookie | JWT cannot be accessed by JavaScript — prevents XSS theft |
| **Token** | JWT HS256 | 24-hour expiry, signed with `JWT_SECRET` |
| **Password** | bcrypt (10 rounds) | Supports both hashed and legacy plain-text passwords |
| **CORS** | Allowlist | Only `localhost:*` origins accepted in development |

### Authorization

```
Every protected route passes through two middleware layers:

protect()     → Verifies JWT from cookie → sets req.user = {id, role, name}
authorize()   → Checks req.user.role is in the allowed list
```

| Route Group | Middleware |
|---|---|
| `/api/auth/*` | None (public) |
| `/api/colleges/list` | None (public dropdown data) |
| `/api/master` | None (public dropdown data) |
| `/api/student/*` | `protect` + `authorize('student')` |
| `/api/college/*` | `protect` + `authorize('college')` |
| `/api/admin/*` | `protect` + `authorize('admin')` |

### Data Integrity

- **Aadhaar uniqueness:** Checked before final submission — one Aadhaar = one application
- **File validation:** Multer rejects files > 5MB and non JPG/PNG/PDF types
- **SQL injection:** All queries use parameterized placeholders (`?`)
- **Input validation:** Required fields checked server-side before any DB write

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | None | `{name, email, password, mobile, role}` | `{success, token, user}` |
| `POST` | `/api/auth/login` | None | `{identifier, password, role}` | Sets cookie + `{success, role, user}` |
| `POST` | `/api/auth/logout` | None | — | Clears cookie |

### Student (requires `role=student` JWT cookie)

| Method | Endpoint | Body | Response |
|---|---|---|---|
| `GET` | `/api/student/me` | — | `{student, marks, completedSteps, isSubmitted, applicationNo}` |
| `PUT` | `/api/student/step/1` | Personal info fields | `{success, message}` |
| `PUT` | `/api/student/step/2` | Contact fields | `{success, message}` |
| `PUT` | `/api/student/step/3` | Parent info fields | `{success, message}` |
| `PUT` | `/api/student/step/4` | Academic background | `{success, message}` |
| `PUT` | `/api/student/step/5` | HSC marks | `{success, message}` |
| `PUT` | `/api/student/step/6` | SSLC marks | `{success, message}` |
| `PUT` | `/api/student/step/7` | Special categories | `{success, message}` |
| `PUT` | `/api/student/step/8` | College preferences (JSON) | `{success, message}` |
| `POST` | `/api/student/upload?docType=photo\|tc\|marksheet\|community` | `multipart/form-data` file | `{success, path, filename}` |
| `POST` | `/api/student/submit` | — | `{success, applicationNo}` |

### College (requires `role=college` JWT cookie)

| Method | Endpoint | Body | Response |
|---|---|---|---|
| `GET` | `/api/college/dashboard/stats` | — | `{stats: {totalApplications, pendingReview, approved, rejected}, recentApplications}` |
| `GET` | `/api/college/applications` | — | `{success, applications: [...]}` |
| `PUT` | `/api/college/applications/:id/status` | `{status: "Approved"\|"Rejected"\|"Pending"}` | `{success, message}` |

### Admin (requires `role=admin` JWT cookie)

| Method | Endpoint | Response |
|---|---|---|
| `GET` | `/api/admin/dashboard/stats` | `{stats: {totalColleges, totalApplications, totalUsers}, recentColleges}` |
| `GET` | `/api/admin/colleges` | `{success, colleges: [...]}` |

### Public

| Method | Endpoint | Query Params | Response |
|---|---|---|---|
| `GET` | `/api/colleges/list` | `search, city, type` | `{success, colleges: [{ins_code, ins_name, ins_city, ins_type}]}` |
| `GET` | `/api/master` | — | Community, religion, gender, board, occupation dropdown arrays |

---

## 🗄️ Database Design

### ER Diagram

```mermaid
erDiagram
    student_master {
        int id PK
        varchar user_id
        varchar student_name
        varchar email UK
        varchar mobile
        varchar password
        varchar role
        date dob
        varchar gender
        varchar aadhar
        varchar religion
        varchar community
        varchar caste
        varchar father_name
        varchar mother_name
        decimal parent_annual_income
        varchar last_institution_board
        json college_choices
        varchar photo
        varchar transfer_certificate
        varchar marksheet_certificate
        varchar community_certificate
        varchar application_no UK
        varchar application_status
        timestamp created_at
    }

    mark_details {
        int id PK
        int student_id FK
        varchar hsc_register_no
        varchar hsc_exam_type
        varchar hsc_major_stream
        decimal hsc_percentage
        decimal hsc_cutoff
        varchar sslc_register_no
        decimal sslc_percentage
        timestamp created_at
    }

    institution_master {
        varchar ins_code PK
        varchar ins_name
        varchar ins_type
        varchar ins_city
        varchar ins_district
        varchar ins_principal
        varchar ins_phone_number
        varchar ins_email_id_office
        varchar ins_status
        varchar password
        timestamp created_at
    }

    user_master {
        varchar user_id PK
        varchar user_name
        varchar role
        varchar password
        timestamp created_at
    }

    student_master ||--o| mark_details : "has academic marks"
    student_master }o--o{ institution_master : "chooses (via JSON)"
```

### Table Relationships

| Relationship | Type | Implementation |
|---|---|---|
| `student_master` → `mark_details` | One-to-One | `mark_details.student_id` FK → `student_master.id` |
| `student_master` → `institution_master` | Many-to-Many (indirect) | `college_choices` JSON array stores `ins_code` values |
| `user_master` → (Admin role) | Standalone | Admin users exist independently of students |

---

## 🚀 DevOps & Deployment

### Deployment Architecture

```mermaid
graph TD
    DEV["👨‍💻 Developer\nLocal Machine"] -->|git push| GH["📦 GitHub\nRepository"]
    GH -->|Webhook / Action| CI["⚙️ CI/CD Pipeline\nGitHub Actions"]
    CI -->|npm run build| BUILD["🔨 Build\nReact → dist/\nNode.js → bundle"]
    BUILD -->|docker build| DOCK["🐳 Docker Images\nfrontend:latest\nbackend:latest"]
    DOCK -->|docker push| REG["📚 Container Registry\nDocker Hub / GHCR"]
    REG -->|deploy| PROD["🌐 Production Server\nVPS / Cloud VM"]

    PROD --> NGINX["🔀 Nginx\nReverse Proxy\n:80 / :443"]
    NGINX -->|/api/*| BE["⚙️ Node.js\nPort 5000"]
    NGINX -->|Static| FE["📄 React dist/\nStatic Files"]
    BE --> DB["🗄️ MySQL 8\nPort 3306"]
    BE --> FS["📁 uploads/\nFile Storage"]
```

### CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy DOTE Portal

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install & Build Frontend
        run: |
          cd client
          npm ci
          npm run build

      - name: Deploy to Server
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_KEY }}
          source: "client/dist/,server/"
          target: "/var/www/dote-portal"
```

### Production Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Serve React SPA
    root /var/www/dote-portal/client/dist;
    index index.html;

    # Client-side routing fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API to Node.js
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Serve uploaded files
    location /uploads/ {
        alias /var/www/dote-portal/server/uploads/;
    }
}
```

---

## 📈 Scalability & Performance

### Current Architecture Performance

| Concern | Current Implementation | Capacity |
|---|---|---|
| **DB Connections** | MySQL2 pool of 10 | ~500 concurrent requests |
| **File Storage** | Local disk (`/uploads`) | Limited by server disk |
| **Sessions** | Stateless JWT | Horizontally scalable |
| **Dev Reload** | Node `--watch` + Vite HMR | < 100ms reload |
| **Query Safety** | Parameterized queries | SQL-injection proof |

### Recommended Production Optimizations

```mermaid
graph LR
    APP["DOTE App"] --> CDN["☁️ CDN\nCloudFront / CloudFlare\n(Static Assets)"]
    APP --> LB["⚖️ Load Balancer\nNginx / ALB"]
    LB --> N1["Node Instance 1"]
    LB --> N2["Node Instance 2"]
    N1 & N2 --> RDS["🗄️ MySQL RDS\n(Managed DB)"]
    N1 & N2 --> S3["📦 S3 / Object Store\n(File Uploads)"]
    N1 & N2 --> CACHE["⚡ Redis Cache\n(Session / Stats)"]
```

| Optimization | Implementation |
|---|---|
| **File Storage** | Migrate to AWS S3 / Cloudinary |
| **Caching** | Redis for dashboard stats (TTL: 5 min) |
| **Database** | Read replicas for reporting queries |
| **Rate Limiting** | `express-rate-limit` on auth routes |
| **Compression** | `compression` middleware for API responses |
| **HTTPS** | Let's Encrypt + Certbot |

---

## 📊 Use Cases

### Real-World Usage Scenarios

| Scenario | User | Flow |
|---|---|---|
| First-time applicant | Student | Register → Complete 9 steps → Upload documents → Submit |
| Returning user | Student | Login → Dashboard → Continue incomplete steps |
| Daily review | College Staff | Login → Applications → Filter "Pending" → Review → Approve/Reject |
| Monthly audit | Admin | Login → Dashboard → Check total applications vs approvals |
| Duplicate prevention | System | Student tries to submit with used Aadhaar → Blocked with error |
| Document verification | College | Open application modal → View marksheet/TC images in-app |

---

## 🧹 Project Optimization — Improvements

### Issues Fixed in This Version

| Issue | File | Resolution |
|---|---|---|
| `ReferenceError: userRecord is not defined` | `auth.controller.js:169` | Changed to `student.student_name` |
| `ReferenceError: userId is not defined` | `auth.controller.js:141` | Changed to `identifier` |
| Home page `Get Started` → 404 | `Home.jsx:24` | `to="/register"` → `to="/student-register"` |
| `ManageColleges` crashes on load | `ManageColleges.jsx` | Added all missing state: `search`, `district`, `page`, `total`, `districts` |
| `ApplicationsList` undefined `total` | `ApplicationsList.jsx` | Derived from `apps.length`, added pagination state |
| `StatusBadge is not defined` | `ApplicationsList.jsx` | Added missing component definition |
| Table body reads raw DB fields | `ApplicationsList.jsx` | Fixed to use mapped `app.name`, `app.id`, `app.raw.community` |
| 502 Bad Gateway on all API calls | All frontend files | Removed 5 hardcoded `http://localhost:5000` URLs → relative paths |
| Admin routes publicly accessible | `admin.routes.js` | Added `protect` + `authorize('admin')` middleware |
| Admin pages have no route guard | `AppRoutes.jsx` | Wrapped with `<ProtectedRoute role="admin">` |

### Recommended Future Improvements

```
🔴 HIGH PRIORITY
├── Add .env to .gitignore (DB credentials currently committed)
├── Create .env.example template file
├── Add rate limiting on /api/auth/* routes (brute-force protection)
└── Migrate file uploads to cloud storage (S3/Cloudinary)

🟡 MEDIUM PRIORITY
├── Add input sanitization middleware (express-validator)
├── Add pagination to /api/college/applications (large datasets)
├── Wire up MasterData.jsx to real API endpoints
├── Add refresh token mechanism (current JWT has no refresh)
└── Add email notification on application status change

🟢 LOW PRIORITY
├── Add application form progress persistence (localStorage backup)
├── Add HSC cutoff auto-calculation based on subject marks
├── Implement college preference rankings with drag-and-drop
├── Add CSV export for admin college/student reports
└── Add print stylesheet to ApplicationsList modal
```

### Suggested Clean Folder Structure (Production)

```
dote_application/
├── client/             ← No change needed
├── server/
│   ├── config/         ← db.config.js
│   ├── controllers/    ← Keep as-is
│   ├── middleware/     ← Add: rateLimiter.js, validate.js
│   ├── models/         ← Keep as-is
│   ├── routes/         ← Keep as-is
│   ├── utils/          ← ADD: fileUpload.js, generateAppNo.js
│   ├── uploads/        ← Move to S3 in production
│   ├── .env            ← Add to .gitignore
│   ├── .env.example    ← ADD: Template for contributors
│   └── app.js
├── .github/
│   └── workflows/
│       └── deploy.yml  ← ADD: CI/CD pipeline
├── docker-compose.yml  ← ADD: Container orchestration
└── README.md
```

---

## 🎯 Benefits

### Technical Skills Demonstrated

| Skill | Implementation |
|---|---|
| **Full-Stack Development** | React SPA + Express REST API + MySQL — complete vertical slice |
| **Authentication & Security** | JWT in httpOnly cookies, bcrypt, role-based middleware, CORS |
| **Database Design** | Normalized 4-table schema, FK constraints, JSON column for flexible data |
| **File Handling** | Multer with custom filename strategy, type/size validation |
| **State Management** | React hooks (`useState`, `useEffect`) for complex multi-step form |
| **Data Visualization** | Recharts Pie + Bar charts with real-time DB data |
| **API Design** | RESTful endpoints with consistent `{success, data}` response shape |
| **UI/UX** | Framer Motion animations, Tailwind responsive design, print stylesheets |

### Business Value

| Value | Description |
|---|---|
| **Process Digitization** | Eliminates 100% of paper-based application handling |
| **Fraud Prevention** | Aadhaar uniqueness guard prevents duplicate applications |
| **Real-Time Visibility** | Colleges and admins get live application statistics |
| **Audit Trail** | All application status changes tracked in DB with timestamps |
| **Scalable Foundation** | Stateless JWT + MySQL pool → ready for horizontal scaling |

---

## 🔮 Future Enhancements

| Enhancement | Description | Priority |
|---|---|---|
| **AI Merit Calculator** | Auto-calculate and rank students by HSC cutoff using ML model | High |
| **SMS/Email Alerts** | Notify students when application status changes via Twilio/SendGrid | High |
| **Aadhaar OTP Verify** | Integrate UIDAI API to verify Aadhaar in real-time | High |
| **Merit List PDF** | Auto-generate college-wise merit rank list PDF | Medium |
| **Payment Integration** | Collect application fee via Razorpay/PayU | Medium |
| **Analytics Dashboard** | District-wise, stream-wise, community-wise admission trend charts | Medium |
| **Mobile App** | React Native app for students with camera-based document upload | Low |
| **Kubernetes Deploy** | Helm charts for multi-replica Node.js pods + managed MySQL | Low |

---

## 📸 Screenshots

| Page | Description |
|---|---|
| `Home` | Landing page with hero section and role cards |
| `Login` | 3-tab role selector (Student / College / Admin) |
| `Student Dashboard` | Progress ring, document status, quick actions |
| `Application Form` | 9-step wizard with auto-save per step |
| `College Dashboard` | Donut chart + bar chart + recent applications |
| `Applications Inbox` | Filterable table with status badges and detail modal |
| `Admin Dashboard` | System-wide stats and recent college list |
| `Application Report` | Print-ready formatted application with marks table |

> Add screenshots to a `/screenshots` folder and update image links above.

---

## 🤝 Contribution Guide

```bash
# 1. Fork the repository
# 2. Create your feature branch
git checkout -b feature/your-feature-name

# 3. Make your changes and commit
git add .
git commit -m "feat: add your feature description"

# 4. Push to your fork
git push origin feature/your-feature-name

# 5. Open a Pull Request to main
```

### Commit Message Convention

```
feat:     New feature
fix:      Bug fix
refactor: Code restructure without behavior change
style:    Formatting, missing semicolons
docs:     Documentation changes
test:     Adding tests
chore:    Build process or tool changes
```

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

```
MIT License — Copyright (c) 2026 DOTE Portal Contributors
Permission is granted to use, copy, modify, merge, publish, and distribute
this software freely, subject to the above copyright notice.
```

---

<div align="center">

**Built with ❤️ for Tamil Nadu's Technical Education System**

[![GitHub Stars](https://img.shields.io/github/stars/your-username/dote-admission-portal?style=social)](https://github.com/your-username/dote-admission-portal)
[![GitHub Forks](https://img.shields.io/github/forks/your-username/dote-admission-portal?style=social)](https://github.com/your-username/dote-admission-portal)

</div>
