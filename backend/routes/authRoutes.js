const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const upload = require('../middleware/upload');
const authenticate = require('../middleware/auth');

// ── Existing Admin / Voter routes (UNCHANGED) ──────────────────
router.post('/admin/login', authController.adminLogin);
router.post('/voter/login', authController.voterLogin);

// ── New Student Auth routes ────────────────────────────────────
router.post('/register', upload.single('profilePhoto'), authController.registerStudent);
router.post('/login',    authController.studentLogin);

// ── Shared "Who am I?" route ──────────────────────────────────
router.get('/me', authenticate, authController.getCurrentUser);

module.exports = router;