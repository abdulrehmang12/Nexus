const express = require('express');
const multer = require('multer');
const Document = require('../models/Document');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const fs = require('fs');
const path = require('path');
const { sanitizeString, parsePositiveNumber } = require('../utils/validation');

const router = express.Router();

const uploadsDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const allowedMimeTypes = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/svg+xml',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/json',
  'text/plain',
]);

router.post('/upload', auth, authorize('investor', 'entrepreneur'), upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'Document file is required' });
    }

    if (!allowedMimeTypes.has(req.file.mimetype)) {
      return res.status(400).json({ msg: 'Unsupported document type' });
    }

    const title = sanitizeString(req.body.title || req.file.originalname, 160);
    const doc = new Document({
      title,
      url: `/uploads/${req.file.filename}`,
      uploadedBy: req.user.id,
      version: parsePositiveNumber(req.body.version) || 1,
      status: 'pending',
    });

    await doc.save();
    res.status(201).json(await doc.populate('uploadedBy', 'name email role'));
  } catch (err) {
    res.status(500).json({ msg: 'Unable to upload document' });
  }
});

router.post('/:id/sign', auth, authorize('investor', 'entrepreneur'), upload.single('signature'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'Signature image is required' });
    }

    if (!['image/png', 'image/jpeg', 'image/svg+xml'].includes(req.file.mimetype)) {
      return res.status(400).json({ msg: 'Signature must be an image file' });
    }

    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ msg: 'Document not found' });
    }

    doc.status = 'signed';
    doc.signatureImageUrl = `/uploads/${req.file.filename}`;
    await doc.save();

    res.json(await doc.populate('uploadedBy', 'name email role'));
  } catch (err) {
    res.status(500).json({ msg: 'Unable to sign document' });
  }
});

router.get('/', auth, authorize('investor', 'entrepreneur'), async (_req, res) => {
  try {
    const docs = await Document.find()
      .populate('uploadedBy', 'name email role')
      .sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ msg: 'Unable to fetch documents' });
  }
});

module.exports = router;
