const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect, authorize } = require('../middleware/auth.middleware');
const { getMe, saveStep, uploadDocument, submitApplication } = require('../controllers/student.controller');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Photo goes to photos folder, others go to documents folder
    const docType = req.body.docType;
    const folder = docType === 'photo' ? 'photos' : 'documents';
    const uploadPath = path.join(__dirname, `../uploads/student/${folder}`);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    // Generate clean filename with docType and timestamp
    cb(null, `${req.user.id}_${req.body.docType}_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only JPG, PNG, PDF files are allowed'));
  },
});

const router = express.Router();

router.use(protect, authorize('student'));

router.get('/me', getMe);
router.put('/step/:step', saveStep);
router.post('/upload', upload.single('file'), uploadDocument);
router.post('/submit', submitApplication);

module.exports = router;
