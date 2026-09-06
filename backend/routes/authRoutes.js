const express = require('express');
const {
  register,
  verifyRegistrationOtp,
  resendRegistrationOtp,
  login,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/verify-registration-otp', verifyRegistrationOtp);
router.post('/resend-registration-otp', resendRegistrationOtp);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
