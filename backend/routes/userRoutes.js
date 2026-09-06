const express = require('express');
const {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getPendingUsers,
  verifyUser
} = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, updateUserProfile);
router.post('/change-password', authMiddleware, changePassword);
router.get('/pending/:status', authMiddleware, getPendingUsers);
router.put('/verify/:userId', authMiddleware, verifyUser);

module.exports = router;
