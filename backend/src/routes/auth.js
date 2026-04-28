const crypto = require('crypto');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middlewares/auth');
const {
  sanitizeString,
  sanitizeList,
  parseOptionalNumber,
} = require('../utils/validation');

const router = express.Router();

const tokenExpirySeconds = 60 * 60 * 8;
const safeUserFields = '-password -otpCode -otpExpiresAt -resetToken -resetTokenExpiresAt';

const signToken = (user) =>
  jwt.sign(
    { user: { id: user.id, role: user.role } },
    process.env.JWT_SECRET,
    { expiresIn: tokenExpirySeconds }
  );

const buildAvatarUrl = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

const normalizeList = (value) => {
  return sanitizeList(value);
};

const profileFromBody = (body, role) => {
  const baseProfile = {
    bio: sanitizeString(body.bio, 1500),
    location: sanitizeString(body.location, 120),
    preferences: normalizeList(body.preferences),
  };

  if (role === 'entrepreneur') {
    return {
      ...baseProfile,
      startupName: sanitizeString(body.startupName, 120),
      pitchSummary: sanitizeString(body.pitchSummary, 1000),
      fundingNeeded: sanitizeString(body.fundingNeeded, 80),
      industry: sanitizeString(body.industry, 80),
      foundedYear: parseOptionalNumber(body.foundedYear),
      teamSize: parseOptionalNumber(body.teamSize),
      startupHistory: normalizeList(body.startupHistory),
    };
  }

  return {
    ...baseProfile,
    investmentInterests: normalizeList(body.investmentInterests),
    investmentStage: normalizeList(body.investmentStage),
    portfolioCompanies: normalizeList(body.portfolioCompanies),
    investmentHistory: normalizeList(body.investmentHistory),
    minimumInvestment: sanitizeString(body.minimumInvestment, 80),
    maximumInvestment: sanitizeString(body.maximumInvestment, 80),
    totalInvestments: parseOptionalNumber(body.totalInvestments) || 0,
  };
};

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ msg: 'Name, email, password, and role are required' });
    }

    if (!['investor', 'entrepreneur'].includes(role)) {
      return res.status(400).json({ msg: 'Invalid role' });
    }

    if (password.length < 8) {
      return res.status(400).json({ msg: 'Password must be at least 8 characters long' });
    }

    const normalizedEmail = sanitizeString(email, 120).toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({
      name: sanitizeString(name, 120),
      email: normalizedEmail,
      password: hashedPassword,
      role,
      avatarUrl: buildAvatarUrl(name),
      ...profileFromBody(req.body, role),
    });

    await user.save();

    const token = signToken(user);
    res.status(201).json({
      token,
      user: await User.findById(user.id).select(safeUserFields),
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: 'Email and password are required' });
    }

    const user = await User.findOne({ email: sanitizeString(email, 120).toLowerCase() });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const token = signToken(user);
    res.json({
      token,
      user: await User.findById(user.id).select(safeUserFields),
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(safeUserFields);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const updates = {
      name: req.body.name ? sanitizeString(req.body.name, 120) : undefined,
      avatarUrl: req.body.avatarUrl ? sanitizeString(req.body.avatarUrl, 500) : undefined,
      ...profileFromBody(req.body, req.user.role),
    };

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        user[key] = value;
      }
    });

    if (!user.avatarUrl && user.name) {
      user.avatarUrl = buildAvatarUrl(user.name);
    }

    await user.save();
    res.json(await User.findById(user.id).select(safeUserFields));
  } catch (err) {
    res.status(500).json({ msg: 'Unable to update profile' });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ msg: 'Email is required' });
    }

    const user = await User.findOne({ email: `${email}`.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ msg: 'No account found for this email' });
    }

    const resetToken = crypto.randomBytes(16).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 15);
    await user.save();

    res.json({
      msg: 'Password reset token generated',
      resetToken,
    });
  } catch (err) {
    res.status(500).json({ msg: 'Unable to generate reset token' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ msg: 'Token and new password are required' });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid or expired reset token' });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = null;
    user.resetTokenExpiresAt = null;
    await user.save();

    res.json({ msg: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ msg: 'Unable to reset password' });
  }
});

router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ msg: 'Current password and new password are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Unable to change password' });
  }
});

router.post('/2fa/request', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const otpCode = `${Math.floor(100000 + Math.random() * 900000)}`;
    user.otpCode = otpCode;
    user.otpExpiresAt = new Date(Date.now() + 1000 * 60 * 10);
    await user.save();

    res.json({
      msg: 'Mock OTP generated',
      otpCode,
    });
  } catch (err) {
    res.status(500).json({ msg: 'Unable to generate OTP' });
  }
});

router.post('/2fa/verify', auth, async (req, res) => {
  try {
    const { otpCode } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (!otpCode || user.otpCode !== otpCode || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      return res.status(400).json({ msg: 'Invalid or expired OTP' });
    }

    user.twoFactorEnabled = true;
    user.otpCode = null;
    user.otpExpiresAt = null;
    await user.save();

    res.json({
      msg: 'Two-factor authentication enabled',
      user: await User.findById(user.id).select(safeUserFields),
    });
  } catch (err) {
    res.status(500).json({ msg: 'Unable to verify OTP' });
  }
});

module.exports = router;
