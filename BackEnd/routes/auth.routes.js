const express = require('express');

const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { loginRateLimit } = require('../middleware/rate-limit.middleware');

router.post('/login', loginRateLimit, authController.login);
router.post('/register', loginRateLimit, authController.register);
router.post('/forgot-password', loginRateLimit, authController.forgotPassword);
router.post('/reset-password', loginRateLimit, authController.resetPassword);
router.get('/check-auth', authenticateToken, authController.checkAuth);
router.put('/profile', authenticateToken, authController.updateProfile);
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;
