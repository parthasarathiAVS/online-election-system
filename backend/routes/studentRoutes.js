const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const studentOnly = require('../middleware/studentOnly');
const studentController = require('../controllers/studentController');
const upload = require('../middleware/upload');

router.use(authenticate, studentOnly);

// GET /api/student/profile
router.get('/profile', studentController.getProfile);

// PUT /api/student/profile
router.put('/profile', upload.single('profilePhoto'), studentController.updateProfile);

// GET /api/student/elections  (elections visible to this student)
router.get('/elections', studentController.getElections);

module.exports = router;
