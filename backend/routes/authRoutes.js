const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendAdminNotification, sendOtpEmail, sendOtpEmailInBackground } = require('../utils/email');

const router = express.Router();

const OTP_TTL_MINUTES = 10;

const createToken = (user) => jwt.sign(
  { id: user._id, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRE || '7d' }
);

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  username: user.username,
  role: user.role,
  avatar: user.avatar,
  verificationStatus: user.verificationStatus,
  emailVerified: user.emailVerified
});

const createOtp = () => String(crypto.randomInt(100000, 1000000));

const hashOtp = (otp) => crypto
  .createHash('sha256')
  .update(`${otp}:${process.env.JWT_SECRET}`)
  .digest('hex');

const otpExpiry = () => new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

const isValidOtp = (user, otp, hashField, expiryField) => (
  user[hashField]
  && user[expiryField]
  && user[expiryField].getTime() > Date.now()
  && user[hashField] === hashOtp(otp)
);

// Register User: creates an email-unverified military account and sends OTP.
router.post('/register', async (req, res) => {
  try {
    const { name, email, username, phone, password, militaryId, rank } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedUsername = username?.trim().toLowerCase();

    if (!name || !normalizedEmail || !normalizedUsername || !phone || !password) {
      return res.status(400).json({ error: 'Name, username, email, phone, and password are required' });
    }

    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { username: normalizedUsername }
      ]
    }).select('+emailOtpHash +emailOtpExpires');

    if (existingUser && existingUser.emailVerified) {
      return res.status(400).json({
        error: existingUser.email === normalizedEmail ? 'Email already registered' : 'Username already taken'
      });
    }

    if (existingUser && existingUser.email !== normalizedEmail) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const otp = createOtp();
    const user = existingUser || new User();

    user.name = name;
    user.email = normalizedEmail;
    user.username = normalizedUsername;
    user.phone = phone;
    user.password = password;
    user.militaryId = militaryId;
    user.rank = rank;
    user.idCardImage = req.body.idCardImage || null;
    user.emailVerified = false;
    user.verificationStatus = 'email_unverified';
    user.emailOtpHash = hashOtp(otp);
    user.emailOtpExpires = otpExpiry();

    await user.save();

    sendOtpEmailInBackground({
      to: normalizedEmail,
      subject: 'Canteen registration OTP',
      otp,
      purpose: 'registration'
    });

    res.status(201).json({
      message: 'OTP sent to your email. Verify it to submit your account for admin approval.',
      email: normalizedEmail
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/verify-registration-otp', async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const otp = req.body.otp?.trim();

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email }).select('+emailOtpHash +emailOtpExpires');
    if (!user) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    if (!isValidOtp(user, otp, 'emailOtpHash', 'emailOtpExpires')) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    user.emailVerified = true;
    user.verificationStatus = 'pending';
    user.emailOtpHash = null;
    user.emailOtpExpires = null;
    await user.save();

    sendAdminNotification({
      subject: `New user verification pending: ${user.name}`,
      text: [
        `${user.name} has verified their email and is waiting for admin approval.`,
        `Email: ${user.email}`,
        `Phone: ${user.phone}`,
        `Military ID: ${user.militaryId || 'Not provided'}`,
        `Rank: ${user.rank || 'Not provided'}`,
      ].join('\n'),
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
          <h2>New user verification pending</h2>
          <p><strong>Name:</strong> ${user.name}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Phone:</strong> ${user.phone}</p>
          <p><strong>Military ID:</strong> ${user.militaryId || 'Not provided'}</p>
          <p><strong>Rank:</strong> ${user.rank || 'Not provided'}</p>
          <p>Open the admin dashboard to approve or reject this account.</p>
        </div>
      `,
    });

    res.json({
      message: 'Email verified. Your account is waiting for admin verification.',
      user: publicUser(user)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/resend-registration-otp', async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email }).select('+emailOtpHash +emailOtpExpires');
    if (!user || user.emailVerified) {
      return res.status(400).json({ error: 'No pending email verification found' });
    }

    const otp = createOtp();
    user.emailOtpHash = hashOtp(otp);
    user.emailOtpExpires = otpExpiry();
    await user.save();

    sendOtpEmailInBackground({
      to: email,
      subject: 'Canteen registration OTP',
      otp,
      purpose: 'registration'
    });

    res.json({ message: 'OTP sent again to your email.' });
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

    if (user.verificationStatus === 'email_unverified') {
      return res.status(403).json({ error: 'Please verify your email OTP before login' });
    }

    if (user.verificationStatus !== 'verified' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Your account is waiting for admin verification' });
    }

    res.json({
      message: 'Login successful',
      token: createToken(user),
      user: publicUser(user)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email }).select('+resetPasswordOtpHash +resetPasswordOtpExpires');
    if (user) {
      const otp = createOtp();
      user.resetPasswordOtpHash = hashOtp(otp);
      user.resetPasswordOtpExpires = otpExpiry();
      await user.save();

      await sendOtpEmail({
        to: email,
        subject: 'Canteen password reset OTP',
        otp,
        purpose: 'password reset'
      });
    }

    res.json({ message: 'If this email is registered, a password reset OTP has been sent.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const otp = req.body.otp?.trim();
    const { password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ error: 'Email, OTP, and new password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ email }).select('+resetPasswordOtpHash +resetPasswordOtpExpires +password');
    if (!user || !isValidOtp(user, otp, 'resetPasswordOtpHash', 'resetPasswordOtpExpires')) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    user.password = password;
    user.resetPasswordOtpHash = null;
    user.resetPasswordOtpExpires = null;
    await user.save();

    res.json({ message: 'Password reset successful. You can login now.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
