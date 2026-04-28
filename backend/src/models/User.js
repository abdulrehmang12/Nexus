const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['investor', 'entrepreneur'], required: true },
  bio: { type: String, default: '' },
  location: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  preferences: { type: [String], default: [] },
  startupName: { type: String, default: '' },
  pitchSummary: { type: String, default: '' },
  fundingNeeded: { type: String, default: '' },
  industry: { type: String, default: '' },
  foundedYear: { type: Number, default: null },
  teamSize: { type: Number, default: null },
  investmentInterests: { type: [String], default: [] },
  investmentStage: { type: [String], default: [] },
  portfolioCompanies: { type: [String], default: [] },
  totalInvestments: { type: Number, default: 0 },
  minimumInvestment: { type: String, default: '' },
  maximumInvestment: { type: String, default: '' },
  startupHistory: { type: [String], default: [] },
  investmentHistory: { type: [String], default: [] },
  twoFactorEnabled: { type: Boolean, default: false },
  otpCode: { type: String, default: null },
  otpExpiresAt: { type: Date, default: null },
  resetToken: { type: String, default: null },
  resetTokenExpiresAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
