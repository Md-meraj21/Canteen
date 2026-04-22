const express = require('express');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, address, updatedAt: Date.now() },
      { new: true }
    );

    res.json({ message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Change password
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    const isPasswordValid = await user.matchPassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pending users for verification (Admin only)
router.get('/pending/:status', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.email !== 'seller@shopkaro.com') {
      return res.status(403).json({ error: 'Only admin can access this' });
    }

    const { status } = req.params;
    const validStatus = ['pending', 'verified', 'rejected'];
    
    if (!validStatus.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const users = await User.find({ verificationStatus: status });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify user (Admin only)
router.put('/verify/:userId', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.email !== 'seller@shopkaro.com') {
      return res.status(403).json({ error: 'Only admin can access this' });
    }

    const { userId } = req.params;
    const { approved, verificationNotes } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        verificationStatus: approved ? 'verified' : 'rejected',
        verificationNotes,
        verifiedBy: req.user.id,
        verifiedAt: new Date()
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User verification updated', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
