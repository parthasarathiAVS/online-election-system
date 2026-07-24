const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/auth');

router.post('/admin/login', authController.adminLogin);
router.post('/voter/login', authController.voterLogin);
router.get('/me', authenticate, authController.getCurrentUser);

module.exports = router;
