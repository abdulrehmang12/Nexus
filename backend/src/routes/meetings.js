const crypto = require('crypto');
const express = require('express');
const Meeting = require('../models/Meeting');
const User = require('../models/User');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const { sanitizeString, parseFutureDate, parsePositiveNumber } = require('../utils/validation');

const router = express.Router();

const isParticipant = (meeting, userId) =>
  `${meeting.host}` === `${userId}` || `${meeting.guest}` === `${userId}`;

router.post('/schedule', auth, authorize('investor', 'entrepreneur'), async (req, res) => {
  try {
    const { title, date, guestId, durationMinutes = 60, notes = '' } = req.body;

    if (!title || !date || !guestId) {
      return res.status(400).json({ msg: 'Title, guest, and date are required' });
    }

    if (`${guestId}` === `${req.user.id}`) {
      return res.status(400).json({ msg: 'You cannot schedule a meeting with yourself' });
    }

    const guest = await User.findById(guestId);
    if (!guest) {
      return res.status(404).json({ msg: 'Guest not found' });
    }

    const start = parseFutureDate(date);
    const duration = parsePositiveNumber(durationMinutes);
    if (!start || start < new Date()) {
      return res.status(400).json({ msg: 'Meeting date must be valid and in the future' });
    }

    if (!duration || duration > 480) {
      return res.status(400).json({ msg: 'Meeting duration must be between 1 and 480 minutes' });
    }

    const end = new Date(start.getTime() + duration * 60000);

    const existingMeetings = await Meeting.find({
      status: { $ne: 'rejected' },
      $or: [
        { host: req.user.id },
        { guest: req.user.id },
        { host: guestId },
        { guest: guestId },
      ],
    });

    const hasConflict = existingMeetings.some((meeting) => {
      const meetingStart = new Date(meeting.date);
      const meetingEnd = new Date(meetingStart.getTime() + (meeting.durationMinutes || 60) * 60000);
      return start < meetingEnd && end > meetingStart;
    });

    if (hasConflict) {
      return res.status(400).json({ msg: 'Meeting time conflicts with an existing booking' });
    }

    const roomId = crypto.randomBytes(6).toString('hex');
    const meeting = new Meeting({
      title: sanitizeString(title, 120),
      host: req.user.id,
      guest: guestId,
      date: start,
      durationMinutes: duration,
      notes: sanitizeString(notes, 1000),
      roomLink: `/meetings/room/${roomId}`,
      calendarEventId: crypto.randomBytes(8).toString('hex'),
    });

    await meeting.save();
    res.status(201).json(await meeting.populate('host guest', 'name email role'));
  } catch (err) {
    res.status(500).json({ msg: 'Unable to schedule meeting' });
  }
});

router.get('/', auth, authorize('investor', 'entrepreneur'), async (req, res) => {
  try {
    const meetings = await Meeting.find({
      $or: [{ host: req.user.id }, { guest: req.user.id }],
    })
      .populate('host', 'name email role')
      .populate('guest', 'name email role')
      .sort({ date: 1 });

    res.json(meetings);
  } catch (err) {
    res.status(500).json({ msg: 'Unable to fetch meetings' });
  }
});

router.put('/:id/status', auth, authorize('investor', 'entrepreneur'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid meeting status' });
    }

    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ msg: 'Meeting not found' });
    }

    if (!isParticipant(meeting, req.user.id)) {
      return res.status(403).json({ msg: 'Forbidden' });
    }

    meeting.status = status;
    await meeting.save();

    res.json(await meeting.populate('host guest', 'name email role'));
  } catch (err) {
    res.status(500).json({ msg: 'Unable to update meeting status' });
  }
});

router.get('/room/:roomId', auth, authorize('investor', 'entrepreneur'), async (req, res) => {
  try {
    const meeting = await Meeting.findOne({
      roomLink: `/meetings/room/${req.params.roomId}`,
    }).populate('host guest', 'name email role');

    if (!meeting) {
      return res.status(404).json({ msg: 'Meeting room not found' });
    }

    if (!isParticipant(meeting, req.user.id)) {
      return res.status(403).json({ msg: 'Forbidden' });
    }

    res.json(meeting);
  } catch (err) {
    res.status(500).json({ msg: 'Unable to fetch meeting room' });
  }
});

module.exports = router;
