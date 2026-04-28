const express = require('express');
const User = require('../models/User');
const auth = require('../middlewares/auth');
const { sanitizeString } = require('../utils/validation');

const router = express.Router();

const publicUserFields = '-password -otpCode -otpExpiresAt -resetToken -resetTokenExpiresAt';

router.get('/', auth, async (req, res) => {
  try {
    const query = {};

    if (req.query.role) {
      query.role = sanitizeString(req.query.role, 30);
    }

    if (req.query.search) {
      const pattern = new RegExp(sanitizeString(req.query.search, 80), 'i');
      query.$or = [
        { name: pattern },
        { bio: pattern },
        { industry: pattern },
        { startupName: pattern },
        { location: pattern },
      ];
    }

    const users = await User.find(query).select(publicUserFields).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Unable to fetch users' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(publicUserFields);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Unable to fetch user' });
  }
});

module.exports = router;
