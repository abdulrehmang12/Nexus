const mongoose = require('mongoose');

const MeetingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guest: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  date: { type: Date, required: true },
  durationMinutes: { type: Number, default: 60 },
  notes: { type: String, default: '' },
  roomLink: { type: String, required: true },
  calendarEventId: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Meeting', MeetingSchema);
