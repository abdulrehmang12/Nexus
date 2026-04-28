const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true }, // Path to S3 or local uploads
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  version: { type: Number, default: 1 },
  status: { type: String, enum: ['pending', 'signed', 'rejected'], default: 'pending' },
  signatureImageUrl: { type: String, default: null } 
}, { timestamps: true });

module.exports = mongoose.model('Document', DocumentSchema);
