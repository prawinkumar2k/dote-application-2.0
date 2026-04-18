# 🚀 QUICK START GUIDE

## 1️⃣ Start the Servers (Choose One)

### Option A: Automatic (PowerShell)
```powershell
cd c:\Users\Hp\Downloads\dote_application\dote_application
powershell -ExecutionPolicy Bypass -File start-all.ps1
```

### Option B: Manual (Two Terminal Windows)
```bash
# Terminal 1: Backend
cd server && npm start

# Terminal 2: Frontend  
cd client && npm run dev
```

Wait for both to show:
- Backend: `listening on port 5000` ✅
- Frontend: `Local: http://localhost:5173` ✅

---

## 2️⃣ Login to Student Application

**URL:** http://localhost:5173

**Email:** `aman.kumar@email.com`  
**Password:** `Student@123`

Other test emails: priya.singh@email.com, rahul.patel@email.com, etc. (All use: Student@123)

---

## 3️⃣ Fill Application Form

9 simple steps:
1. ✅ Personal Details (birthdate, gender, community, religion)
2. ✅ Contact Info (email, address)
3. ✅ Parent Details (name, occupation, income)
4. ✅ Academic History (board, register no, institution)
5. ✅ HSC Marks (English, Maths, Physics, Chemistry + 2 electives)
6. ✅ SSLC Marks (Tamil, English, Maths, Science, Social)
7. ✅ Special Category (disabled, sports, ex-serviceman, govt school)
8. ✅ College Choice (select 3 colleges by city/type)
9. ✅ Upload Documents (photo, TC, marksheet, community cert)

Each step auto-saves when you click "Save & Next"

---

## 4️⃣ Submit Application

Final step generates **Application Number** like: `APP2025001`

---

## 📊 API Quick Reference

### Get Dropdown Values
```bash
curl http://localhost:5000/api/master | jq .community
# Returns: ["BC", "OBC", "OC", "SC/ST", ...]
```

### Get College List
```bash
curl "http://localhost:5000/api/colleges/list?type=Government"
# Returns: Array of colleges
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "aman.kumar@email.com",
    "password": "Student@123",
    "role": "student"
  }'
# Returns: JWT token in cookie
```

---

## 🐛 Troubleshooting

### "Cannot reach localhost:5000"
- Is backend running? Check terminal 1
- Port 5000 in use by something else?
  ```bash
  taskkill /F /IM node.exe
  npm start  # in server folder
  ```

### "404 errors on /api/*"
- Vite proxy working?
- Check `client/vite.config.js` has `/api` proxy
- Restart frontend: `npm run dev`

### "Dropdown showing undefined"
- /api/master not loading?
- Check browser DevTools → Network tab
- Verify http://localhost:5000/api/master responds

### "Cannot login"
- Email is: `aman.kumar@email.com` (not user_id)
- Password is: `Student@123` (with capital S)
- Role is: `student`

### "Form fields empty"
- /api/student/me returns 401?
- JWT not in cookie? Relogin
- Database has no student record? Use test email

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `server/app.js` | Backend API setup |
| `client/vite.config.js` | Proxy config |
| `client/src/pages/Student/ApplicationForm.jsx` | Form component |
| `server/models/student.model.js` | Student DB queries |
| `server/controllers/student.controller.js` | Form save logic |

---

## ✨ What's Automated

✅ Master data loads from DB (communities, religions, genders, etc.)  
✅ Colleges load from DB (500+ available)  
✅ Form auto-saves each step (no manual save needed)  
✅ Student data pre-fills if already started  
✅ Files auto-upload and attach  
✅ Application number auto-generated on submit  

---

## 🎉 That's It!

Your DOTE Admission Portal is ready to use.

**Having issues?** Check the troubleshooting above or review:
- `IMPLEMENTATION_COMPLETE.md` (full features)
- `SYSTEM_VERIFICATION.md` (all tested endpoints)

**Questions?** All database values load dynamically from:
- Host: `88.222.244.171`
- Database: `admission_dote`
- User: `ems_navicat`

Enjoy! 🚀
