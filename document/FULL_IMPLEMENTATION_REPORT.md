# DOTE Admission Portal — Full Implementation Report

**Date:** April 19, 2026  
**Branch:** develop  
**Database:** `admission_dote` on `88.222.244.171:3306`  
**Status:** Fully Implemented ✅

---

## 1. Project Overview

The DOTE (Directorate of Technical Education) Admission Portal is a full-stack web application that manages polytechnic college admissions across Tamil Nadu. It serves three user roles:

| Role | Purpose |
|---|---|
| **Student** | Register, fill a 9-step application form, upload documents, submit |
| **College** | View submitted student applications, see detailed profiles |
| **Admin** | Monitor system-wide stats, browse 489 real colleges from DB |

**Tech Stack:**
- Frontend: React 19 + Vite + TailwindCSS v4
- Backend: Node.js + Express 5 + MySQL2
- Auth: JWT (HTTP-only cookie) + bcryptjs
- File Uploads: Multer

---

## 2. Database — Existing Tables Used (No New Tables Created)

All data is stored in the 4 existing tables. Zero new tables were created.

### `student_master` — Student profiles + full application data
| Column | Maps To |
|---|---|
| `student_name` | Step 1: Full Name |
| `dob`, `gender`, `aadhar` | Step 1: Personal details |
| `religion`, `community`, `caste` | Step 1: Category details |
| `mother_tongue`, `medium_of_instruction` | Step 1: Language details |
| `email`, `alt_mobile` | Step 2: Contact info |
| `communication_address`, `permanent_address` | Step 2: Addresses |
| `father_name`, `mother_name` | Step 3: Parent details |
| `parent_occupation`, `parent_annual_income` | Step 3: Parent info |
| `last_institution_board`, `last_institution_register_no` | Step 4: Academic history |
| `last_institution_name`, `last_institution_district` | Step 4: Academic history |
| `differently_abled`, `ex_servicemen`, `eminent_sports` | Step 7: Special category |
| `school_type` | Step 7: Govt school flag |
| `college_choices` | Step 8: College preferences (JSON array of ins_codes) |
| `hostel_choice`, `womens_choice` | Step 8: Hostel preference |
| `photo`, `transfer_certificate` | Step 9: Uploaded file paths |
| `marksheet_certificate`, `community_certificate` | Step 9: Uploaded file paths |
| `application_no` | NULL = draft, `DOTE-2026-XXXXXX` = submitted |
| `role`, `user_id`, `password` | Auth fields |

### `mark_details` — HSC + SSLC + ITI + VOC marks
| Column Group | Maps To |
|---|---|
| `hsc_subject1–6`, `hsc_subject1–6_obtained_mark`, `hsc_subject1–6_max_mark` | Step 5: HSC marks entry |
| `hsc_register_no`, `hsc_exam_type`, `hsc_major_stream` | Step 5: HSC metadata |
| `hsc_total_mark`, `hsc_total_obtained_mark`, `hsc_percentage`, `hsc_cutoff` | Step 5: HSC totals |
| `sslc_subject1–5`, `sslc_subject1–5_obtained_mark`, `sslc_subject1–5_max_mark` | Step 6: SSLC marks |
| `sslc_register_no`, `sslc_marksheet_no`, `sslc_percentage` | Step 6: SSLC metadata |
| `student_id` | FK → student_master.id |

### `institution_master` — 489 real colleges
| Column | Used For |
|---|---|
| `ins_code` | College login identifier + student preference value |
| `ins_name`, `ins_type`, `ins_district` | Display in admin portal + college choice dropdown |
| `ins_status = "1"` | Filter for active colleges only |
| `ins_principal`, `ins_phone_number`, `ins_email_id_office` | Display in admin college table |
| `role`, `password` | College login authentication |

### `user_master` — Admin accounts
| Column | Used For |
|---|---|
| `user_id` | Admin login identifier (e.g. `admin_dote`) |
| `user_name`, `role`, `password` | Auth and display |

---

## 3. Authentication System

### Login Flow
1. User selects role tab: **Student / College / Admin**
2. Enters identifier:
   - Student → **Email address**
   - College → **College code** (e.g. `101`, `102`)
   - Admin → **User ID** (e.g. `admin_dote`)
3. POST `/api/auth/login` → validates credentials → signs JWT
4. JWT stored as **HTTP-only cookie** (expires in 24h)
5. User object `{ id, name, role }` saved to **localStorage**
6. Redirected to `/${role}/dashboard`

### Logout Flow
1. Click logout button in navbar
2. POST `/api/auth/logout` → clears cookie server-side
3. `localStorage.removeItem('user')` on client
4. Redirect to `/login`

### Registration (Student Only)
1. Fill form: Name, Email, Mobile, DOB, Gender, Password
2. POST `/api/auth/register`
3. Backend checks email uniqueness in `student_master`
4. bcrypt hashes password (10 rounds)
5. Generates `user_id = STU + timestamp`
6. INSERT into `student_master`
7. Returns JWT cookie — auto logged in

### Route Protection
All dashboard routes are wrapped in `ProtectedRoute.jsx`:
- Reads `user` from localStorage
- If not found → redirect to `/login`
- If wrong role → redirect to correct dashboard
- `/admin/*` requires role = `admin`
- `/college/*` requires role = `college`
- `/student/*` requires role = `student`

### Test Credentials
| Role | Identifier | Password |
|---|---|---|
| Admin | `admin_dote` | `Admin@12345` |
| Student | `aman.kumar@email.com` | `Student@123` |
| Student | `priya.singh@email.com` | `Student@123` |
| College | `101` (Central Polytechnic) | *(set in DB)* |

---

## 4. ApplicationForm — 9-Step Flow

The form auto-saves each step to the database on "Save & Next". Students can leave and resume — data is reloaded from DB on mount.

### Step 1 — Personal Details
**Saves to:** `student_master`  
Fields: Full Name, DOB, Gender, Aadhaar, Religion, Community, Caste, Admission Type, Mother Tongue, Medium of Instruction  
**API:** `PUT /api/student/step/1`

### Step 2 — Contact Information
**Saves to:** `student_master`  
Fields: Email, Alternate Mobile, Communication Address, Permanent Address (or checkbox: same as comm)  
**API:** `PUT /api/student/step/2`

### Step 3 — Parent / Guardian Details
**Saves to:** `student_master`  
Fields: Father's Name, Mother's Name, Parent Occupation, Annual Income  
**API:** `PUT /api/student/step/3`

### Step 4 — Academic History
**Saves to:** `student_master`  
Fields: Qualifying Board, Register Number, Last Institute Name, Last Institute District  
**API:** `PUT /api/student/step/4`

### Step 5 — Marks Entry (HSC)
**Saves to:** `mark_details` (INSERT or UPDATE)  
Fields: 6 subject names + obtained marks + max marks, HSC register no, exam type, stream, percentage, cutoff  
**API:** `PUT /api/student/step/5`

### Step 6 — Educational History (SSLC)
**Saves to:** `mark_details` (INSERT or UPDATE)  
Fields: 5 SSLC subject names + marks, register no, marksheet no, overall percentage  
**API:** `PUT /api/student/step/6`

### Step 7 — Special Category
**Saves to:** `student_master`  
Fields: Differently Abled (yes/no), Ex-Serviceman's Ward (yes/no), Sports Person (yes/no), Govt School Student (yes/no)  
**API:** `PUT /api/student/step/7`

### Step 8 — College Choice
**Saves to:** `student_master.college_choices` (JSON array), `hostel_choice`, `womens_choice`  
Fields: 3 ordered college preferences (from live `institution_master` dropdown — 489 real colleges), Hostel Required, Women's Hostel  
**API:** `PUT /api/student/step/8`  
**Dropdown Source:** `GET /api/colleges/list` (public, no auth)

### Step 9 — Document Uploads & Submission
**Saves to:** `student_master` file path columns  
Files: Passport Photo, Transfer Certificate, Qualifying Marksheet, Community Certificate  
**Upload API:** `POST /api/student/upload` (multipart/form-data)  
- Files stored at: `server/uploads/student/<studentId>_<docType>_<timestamp>.<ext>`
- Allowed types: JPG, PNG, PDF (max 5MB)
- File path saved to DB immediately on upload
- Upload box shows green checkmark when uploaded

**Final Submit:**  
`POST /api/student/submit` → sets `application_no = 'DOTE-2026-XXXXXX'` → toast notification → redirect to My Application page

### Auto-load on Mount
On opening the form, `GET /api/student/me` is called:
- Fetches all saved data from `student_master` + `mark_details`
- Pre-fills all form fields
- Shows "Submitted" badge if already submitted

---

## 5. API Endpoints — Complete List

### Auth Routes (`/api/auth`)
| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/login` | Multi-role login, returns JWT cookie |
| POST | `/api/auth/register` | Student registration |
| POST | `/api/auth/logout` | Clears JWT cookie |

### Student Routes (`/api/student`) — requires student JWT
| Method | Route | Description |
|---|---|---|
| GET | `/api/student/me` | Full student profile + marks + completion status |
| PUT | `/api/student/step/:n` | Save step n data (1–8) |
| POST | `/api/student/upload` | Upload file (photo/tc/marksheet/community) |
| POST | `/api/student/submit` | Final submit, generates application_no |

### College Routes (`/api/college`) — requires college JWT
| Method | Route | Description |
|---|---|---|
| GET | `/api/college/dashboard` | Submitted application counts |
| GET | `/api/college/applications` | List submitted applications (search + pagination) |
| GET | `/api/college/applications/:id` | Full student detail + marks |

### Admin Routes (`/api/admin`) — requires admin JWT
| Method | Route | Description |
|---|---|---|
| GET | `/api/admin/dashboard` | System-wide counts from all tables |
| GET | `/api/admin/colleges` | List institutions (search + district filter + pagination) |
| GET | `/api/admin/districts` | All unique districts from institution_master |
| GET | `/api/admin/students` | List all students (search + pagination) |

### Public Route (no auth)
| Method | Route | Description |
|---|---|---|
| GET | `/api/colleges/list` | All active colleges for form dropdown |

---

## 6. File Upload System

**Library:** Multer (installed: `npm install multer`)  
**Storage location:** `server/uploads/student/`  
**Naming pattern:** `<studentId>_<docType>_<timestamp>.<ext>`  
**Served as static:** `GET /uploads/student/<filename>` (Express static middleware)  
**Allowed types:** `.jpg`, `.jpeg`, `.png`, `.pdf`  
**Max size:** 5MB per file  

**4 document types:**
| docType value | DB Column | Label |
|---|---|---|
| `photo` | `student_master.photo` | Passport Photo |
| `tc` | `student_master.transfer_certificate` | Transfer Certificate |
| `marksheet` | `student_master.marksheet_certificate` | Qualifying Marksheet |
| `community` | `student_master.community_certificate` | Community Certificate |

---

## 7. Frontend Pages — What Each Does

### Public Pages
| Page | Route | Description |
|---|---|---|
| Home | `/` | Landing page with role info and CTA buttons |
| Login | `/login` | 3-role tabbed login form |
| Register | `/register` | Student registration with full validation |

### Student Pages (protected)
| Page | Route | Description |
|---|---|---|
| Dashboard | `/student/dashboard` | Real name, progress bar, app status, completion % |
| ApplicationForm | `/student/apply` | 9-step form with auto-save and file upload |
| My Application | `/student/my-application` | Full view of saved data, download JSON, print PDF |

### College Pages (protected)
| Page | Route | Description |
|---|---|---|
| Dashboard | `/college/dashboard` | Stats + recent submitted applications |
| Applications List | `/college/applications` | Searchable table of all submitted applications |
| Application Detail | `/college/applications/:id` | Full student profile + HSC/SSLC marks + docs |

### Admin Pages (protected)
| Page | Route | Description |
|---|---|---|
| Dashboard | `/admin/dashboard` | Live counts from all 4 DB tables + 5 recent colleges |
| Manage Colleges | `/admin/colleges` | All 489 colleges with search + district filter + pagination |
| Master Data | `/admin/master-data` | Static reference data (communities, castes, boards) |

---

## 8. Bug Fixes Applied

| Bug | Fix Applied |
|---|---|
| `DB_PASS='Test@12345'` — quoted value broke MySQL connection | Removed quotes → `DB_PASS=Test@12345` |
| `DB_PORT` passed as string to MySQL2 | Wrapped with `parseInt()` |
| College login used `user_id` but `institution_master` has no such column | Changed to `findByInsCode(ins_code)` |
| Logout used `GET` method (REST violation) | Changed to `POST /api/auth/logout` |
| CORS origin was hardcoded to localhost | Changed to `process.env.CLIENT_URL \|\| 'http://localhost:5173'` |
| Logout in MainLayout only navigated, didn't call API or clear localStorage | Fixed: calls API + `localStorage.removeItem('user')` |
| ApplicationForm Step 5 marks used `defaultValue` (uncontrolled) | Changed to controlled `value` + `onChange` |
| ApplicationForm Step 6 buttons had no handlers | Fully implemented SSLC form |
| ApplicationForm Step 9 had no real file inputs | Added `<input type="file">` + upload API |
| ApplicationForm final submit made no API call | Wired to `POST /api/student/submit` |
| All dashboard pages showed hardcoded mock data | Replaced with real API calls |
| No route protection — anyone could access any page | Added `ProtectedRoute.jsx` on all role routes |
| Register page had no state, no handler, no API | Fully implemented |
| College login password fix: `bg-gradient-to-r` Tailwind warning | Changed to canonical `bg-linear-to-r` (Tailwind v4) |

---

## 9. New Files Created

### Backend (`server/`)
```
server/
├── models/
│   ├── application.model.js     — mark_details INSERT/UPDATE for steps 5 & 6
│   ├── institution.model.js     — findByInsCode, getAll, getDistricts (REWRITTEN)
│   └── student.model.js         — full CRUD, updateStep1–8, submit (REWRITTEN)
├── controllers/
│   ├── student.controller.js    — getMe, saveStep, uploadDocument, submitApplication
│   ├── college.controller.js    — getDashboard, getApplications, getApplicationDetail
│   └── admin.controller.js      — getDashboard, getColleges, getDistricts, getStudents
└── routes/
    ├── student.routes.js        — multer setup + protected student routes
    ├── college.routes.js        — protected college routes
    └── admin.routes.js          — protected admin routes
```

### Frontend (`client/src/`)
```
client/src/
├── routes/
│   └── ProtectedRoute.jsx                    — role-based route guard
└── pages/
    └── College/
        └── ApplicationDetail.jsx             — full student detail view for colleges
```

---

## 10. Files Modified

### Backend
| File | What Changed |
|---|---|
| `server/.env` | Removed quotes from DB_PASS |
| `server/app.js` | Mounted all new routes, added uploads static, CORS from env |
| `server/config/db.config.js` | `parseInt(DB_PORT)` |
| `server/routes/auth.routes.js` | Added register route, logout GET→POST |
| `server/controllers/auth.controller.js` | Added register(), fixed college login to use ins_code |

### Frontend
| File | What Changed |
|---|---|
| `client/src/routes/AppRoutes.jsx` | All routes wrapped with ProtectedRoute, added ApplicationDetail route |
| `client/src/components/layout/MainLayout.jsx` | Logout calls API + clears localStorage, shows real user name |
| `client/src/pages/Auth/Login.jsx` | Saves user to localStorage, college placeholder updated |
| `client/src/pages/Auth/Register.jsx` | Full form with state + validation + API call |
| `client/src/pages/Student/ApplicationForm.jsx` | Complete rewrite — all 9 steps controlled, auto-save, real uploads, submit |
| `client/src/pages/Student/Dashboard.jsx` | Real API data: progress bar, app status, student info |
| `client/src/pages/Student/MyApp.jsx` | Real API data: all student fields, marks table, download JSON, print |
| `client/src/pages/College/Dashboard.jsx` | Real stats + recent applications from DB |
| `client/src/pages/College/ApplicationsList.jsx` | Real data with search + pagination |
| `client/src/pages/Admin/Dashboard.jsx` | Live counts + 5 recent colleges from institution_master |
| `client/src/pages/Admin/ManageColleges.jsx` | All 489 colleges from DB with search + district filter + pagination |

---

## 11. Application Status Logic

Since no new tables were created, application status is tracked using the `application_no` column in `student_master`:

| `application_no` value | Meaning |
|---|---|
| `NULL` | Not yet submitted (draft in progress) |
| `DOTE-2026-000001` | Submitted (format: DOTE-YYYY-studentId padded to 6 digits) |

Progress tracking (completedSteps) is calculated at runtime by checking which fields are filled:
- Step 1 complete → `student_name` AND `dob` AND `gender` are set
- Step 2 complete → `email` AND `communication_address` are set
- Step 3 complete → `father_name` AND `mother_name` are set
- Step 4 complete → `last_institution_board` AND `last_institution_register_no` are set
- Step 5 complete → mark_details row exists AND `hsc_subject1_obtained_mark` is set
- Step 6 complete → `sslc_register_no` is set
- Step 7 complete → `differently_abled` is not null
- Step 8 complete → `college_choices` is not null
- Step 9 complete → `photo` path is set

---

## 12. Running the Project

### Start Backend
```bash
cd server
npm run dev     # uses node --watch server.js
# Runs on: http://localhost:5000
```

### Start Frontend
```bash
cd client
npm run dev     # Vite dev server
# Runs on: http://localhost:5173
```

### Vite Proxy
All `/api` requests from the frontend are proxied to `http://localhost:5000` via `vite.config.js`. No CORS issues in development.

---

## 13. Folder Structure (Final)

```
dote_application/
├── client/                          React frontend
│   └── src/
│       ├── routes/
│       │   ├── AppRoutes.jsx        All routes with protection
│       │   └── ProtectedRoute.jsx   Role-based auth guard
│       ├── components/layout/
│       │   └── MainLayout.jsx       Shared navbar + sidebar + footer
│       └── pages/
│           ├── Auth/                Login + Register
│           ├── Admin/               Dashboard + ManageColleges + MasterData
│           ├── College/             Dashboard + ApplicationsList + ApplicationDetail
│           └── Student/             Dashboard + ApplicationForm + MyApp
│
├── server/                          Node.js backend
│   ├── uploads/
│   │   └── student/                 Uploaded files stored here
│   ├── config/db.config.js          MySQL2 pool
│   ├── middleware/auth.middleware.js protect + authorize
│   ├── models/                      DB query functions
│   ├── controllers/                 Business logic
│   └── routes/                      Express routers
│
└── document/                        Project documentation
    └── FULL_IMPLEMENTATION_REPORT.md  ← this file
```

---

*Implemented by Claude on April 19, 2026. All features use the 4 existing database tables — no new tables were created.*
