const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Register User
router.post('/register', async (req, res) => {
  try {
    const { name, email, username, phone, password, militaryId, rank } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedUsername = username?.trim().toLowerCase();

    if (!name || !normalizedEmail || !normalizedUsername || !phone || !password) {
      return res.status(400).json({ error: 'Name, username, email, phone, and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { username: normalizedUsername }
      ]
    });
    if (existingUser) {
      return res.status(400).json({
        error: existingUser.email === normalizedEmail ? 'Email already registered' : 'Username already taken'
      });
    }

    // Create new user
    const user = new User({ 
      name, 
      email: normalizedEmail,
      username: normalizedUsername,
      phone, 
      password,
      militaryId,
      rank,
      idCardImage: req.body.idCardImage || null,
      verificationStatus: 'pending' // Always pending for military users
    });
    await user.save();

    // Don't return token - user needs verification first
    res.status(201).json({
      message: 'User registered successfully. Please wait for admin verification.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        verificationStatus: user.verificationStatus
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { identifier, email, username, password } = req.body;
    const loginId = (identifier || email || username || '').trim().toLowerCase();

    if (!loginId || !password) {
      return res.status(400).json({ error: 'Username/email and password required' });
    }


    const user = await User.findOne({
      $or: [
        { email: loginId },
        { username: loginId }
      ]
    }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        verificationStatus: user.verificationStatus
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
