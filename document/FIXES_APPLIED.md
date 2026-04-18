# DOTE Admission Portal — Fixes Applied

**Date:** 2026-04-18  
**Branch:** develop

---

## Summary

A full audit of the project was performed. All identified errors — critical, high, medium, and low priority — were resolved across both the server and client codebases.

---

## Server Fixes

### 1. `server/.env` — DB_PASS quoted value (Critical)
**File:** `server/.env:6`  
**Problem:** `DB_PASS='Test@12345'` — dotenv does not strip single quotes on Windows, so the literal string `'Test@12345'` (with quotes) was passed to MySQL, causing authentication failure.  
**Fix:** Removed surrounding single quotes → `DB_PASS=Test@12345`

### 2. `server/.env` — Untracked from git (Critical)
**Problem:** `server/.env` containing real database credentials and JWT secret was committed to version control since the first commit.  
**Fix:** Ran `git rm --cached server/.env` to untrack the file. The `.gitignore` already listed `.env`; now it will prevent future accidental commits.

### 3. `server/config/db.config.js:9` — DB_PORT as string (Critical)
**Problem:** `port: process.env.DB_PORT` passed an environment string to mysql2, which expects a number.  
**Fix:** Changed to `port: parseInt(process.env.DB_PORT, 10)`

### 4. `server/app.js:14` — CORS origin hardcoded (High)
**Problem:** `origin: 'http://localhost:5173'` — ignored the `CORS_ORIGIN` env variable, making production deployment impossible without code changes.  
**Fix:** Changed to `origin: process.env.CORS_ORIGIN || 'http://localhost:5173'` and added `CORS_ORIGIN=http://localhost:5173` to `.env`.

### 5. `server/routes/auth.routes.js:6` — Logout used GET instead of POST (High)
**Problem:** `router.get('/logout', logout)` — violates REST conventions; GET requests should be idempotent with no side effects. Also mismatched the API documentation which specified `POST /api/auth/logout`.  
**Fix:** Changed to `router.post('/logout', logout)`

### 6. `server/server.js:9-13` — unhandledRejection didn't shut down server (High)
**Problem:** The `process.on('unhandledRejection')` handler had `server.close()` commented out, leaving the server in a broken state after unhandled promise rejections.  
**Fix:** Assigned `app.listen()` to `const server` and enabled `server.close(() => process.exit(1))`

### 7. `server/controllers/auth.controller.js:40` — COOKIE_EXPIRE string multiplication (Low)
**Problem:** `process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000` relied on implicit JS string-to-number coercion.  
**Fix:** Changed to `parseInt(process.env.COOKIE_EXPIRE, 10) * 24 * 60 * 60 * 1000`

---

## Client Fixes

### 8. `client/index.html:6` — Page title was "frontend" (Medium)
**Problem:** Browser tabs showed "frontend" — leftover from Vite scaffolding.  
**Fix:** Changed `<title>frontend</title>` to `<title>DOTE Admission Portal</title>`

### 9. `client/src/components/layout/MainLayout.jsx:4` — AnimatePresence unused import (Medium)
**Problem:** `AnimatePresence` was imported from `framer-motion` but never used in the JSX, causing an ESLint `no-unused-vars` error.  
**Fix:** Removed `AnimatePresence` from the import statement.

### 10. `client/src/components/layout/MainLayout.jsx:10-13` — Logout didn't call API or clear storage (High)
**Problem:** `handleLogout` only called `navigate('/login')` — it didn't call `POST /api/auth/logout` to clear the server cookie, nor clear localStorage. Users weren't truly logged out.  
**Fix:** Updated `handleLogout` to call the logout API endpoint and `localStorage.removeItem('user')` before navigating.

### 11. `client/src/pages/Auth/Login.jsx:92` — Markdown bold syntax rendered literally (Medium)
**Problem:** `**Admin**` and `**admin_dote**` rendered as literal asterisks in the browser since JSX does not parse markdown.  
**Fix:** Replaced `**text**` with `<strong>text</strong>` JSX tags.

### 12. `client/src/pages/Auth/Login.jsx` — No session persistence after login (High)
**Problem:** After successful login the user's identity was never stored. Page refresh lost all auth state, and dashboard pages received hardcoded role props.  
**Fix:** Added `localStorage.setItem('user', JSON.stringify(response.data.user))` on successful login.

### 13. `client/src/pages/Auth/Register.jsx` — Form had no state or submit handler (High)
**Problem:** The registration form had no `onSubmit`, no state management, and no API call. Submitting the form did nothing.  
**Fix:** Rewrote the component with `useState` for all fields, password confirmation validation, and an `axios.post` call to `POST /api/auth/register`.

### 14. `client/src/routes/AppRoutes.jsx` — No route protection (High)
**Problem:** All dashboard routes (admin, college, student) were directly accessible without authentication. Any visitor could navigate to `/admin/dashboard`.  
**Fix:** Added a `ProtectedRoute` component that reads `localStorage` for a stored user. Unauthenticated users are redirected to `/login`; users with the wrong role are redirected to `/`.

### 15. `client/src/pages/Student/ApplicationForm.jsx` — MarksEntry inputs uncontrolled (Medium)
**Problem:** Mark input fields had no `name`, `value`, or `onChange` — data entered in Step 5 was never captured in `formData.marks` and would be empty on submit.  
**Fix:** Replaced uncontrolled inputs with controlled inputs reading from `data.marks[subject]`. Added a `handleMarksChange` helper that updates `formData.marks` via a synthetic event pattern.

---

## Files Changed

| File | Type |
|---|---|
| `server/.env` | Fixed DB_PASS quotes; added CORS_ORIGIN; untracked from git |
| `server/config/db.config.js` | DB_PORT parsed to integer |
| `server/app.js` | CORS origin reads from env var |
| `server/routes/auth.routes.js` | Logout changed from GET to POST |
| `server/server.js` | unhandledRejection now closes server gracefully |
| `server/controllers/auth.controller.js` | COOKIE_EXPIRE uses parseInt |
| `client/index.html` | Title fixed to "DOTE Admission Portal" |
| `client/src/components/layout/MainLayout.jsx` | Removed unused AnimatePresence; logout calls API + clears storage |
| `client/src/pages/Auth/Login.jsx` | Markdown bold fixed; user saved to localStorage |
| `client/src/pages/Auth/Register.jsx` | Full rewrite with state, validation, and API call |
| `client/src/routes/AppRoutes.jsx` | Added ProtectedRoute with role-based access control |
| `client/src/pages/Student/ApplicationForm.jsx` | MarksEntry inputs are now fully controlled |

---

## Known Remaining Work (Out of Scope)

These items were noted but not fixed as they require backend API endpoints or larger feature work:

- All dashboard data is hardcoded/mocked — needs real API routes for admin, college, and student data
- `POST /api/auth/register` endpoint does not exist yet on the server
- No validation middleware (express-validator) on server routes
- No helmet or rate-limiting middleware
- `document/.env.example` should be moved to `server/.env.example`
