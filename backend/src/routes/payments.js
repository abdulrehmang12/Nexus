const crypto = require('crypto');
const express = require('express');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const { parsePositiveNumber, sanitizeString } = require('../utils/validation');

const router = express.Router();

const validProviders = new Set(['stripe', 'paypal']);
const validStatuses = new Set(['pending', 'completed', 'failed']);

const createTransaction = async ({
  userId,
  type,
  amount,
  counterpartyUserId = null,
  provider = 'stripe',
  paymentMethod = 'sandbox',
  note = '',
  requestedStatus = 'completed',
}) => {
  const status = validStatuses.has(requestedStatus) ? requestedStatus : 'completed';

  const transaction = new Transaction({
    user: userId,
    type,
    amount,
    counterpartyUserId,
    provider,
    paymentMethod,
    note,
    providerSessionId: `${provider}_sandbox_${crypto.randomBytes(6).toString('hex')}`,
    reference: `${type.toUpperCase()}-${Date.now()}`,
    status,
  });

  await transaction.save();
  return transaction;
};

const parsePaymentRequest = (req) => {
  const amount = parsePositiveNumber(req.body.amount);
  const provider = sanitizeString(req.body.provider || 'stripe', 20).toLowerCase();
  const paymentMethod = sanitizeString(req.body.paymentMethod || 'sandbox', 30);
  const requestedStatus = sanitizeString(req.body.requestedStatus || 'completed', 20).toLowerCase();
  const note = sanitizeString(req.body.note || '', 240);

  if (!amount) {
    return { error: 'A valid positive amount is required' };
  }

  if (!validProviders.has(provider)) {
    return { error: 'Provider must be stripe or paypal' };
  }

  if (!validStatuses.has(requestedStatus)) {
    return { error: 'Requested status must be pending, completed, or failed' };
  }

  return { amount, provider, paymentMethod, requestedStatus, note };
};

router.get('/providers', auth, authorize('investor', 'entrepreneur'), (_req, res) => {
  res.json([
    { id: 'stripe', label: 'Stripe Sandbox' },
    { id: 'paypal', label: 'PayPal Sandbox' },
  ]);
});

router.post('/deposit', auth, authorize('investor', 'entrepreneur'), async (req, res) => {
  try {
    const parsed = parsePaymentRequest(req);
    if (parsed.error) {
      return res.status(400).json({ msg: parsed.error });
    }

    const transaction = await createTransaction({
      userId: req.user.id,
      type: 'deposit',
      ...parsed,
    });

    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ msg: 'Unable to process deposit' });
  }
});

router.post('/withdraw', auth, authorize('investor', 'entrepreneur'), async (req, res) => {
  try {
    const parsed = parsePaymentRequest(req);
    if (parsed.error) {
      return res.status(400).json({ msg: parsed.error });
    }

    const transaction = await createTransaction({
      userId: req.user.id,
      type: 'withdraw',
      ...parsed,
    });

    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ msg: 'Unable to process withdrawal' });
  }
});

router.post('/transfer', auth, authorize('investor', 'entrepreneur'), async (req, res) => {
  try {
    const parsed = parsePaymentRequest(req);
    if (parsed.error) {
      return res.status(400).json({ msg: parsed.error });
    }

    const recipientId = sanitizeString(req.body.recipientId, 60);
    if (!recipientId) {
      return res.status(400).json({ msg: 'A recipient is required' });
    }

    if (`${recipientId}` === `${req.user.id}`) {
      return res.status(400).json({ msg: 'You cannot transfer to yourself' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ msg: 'Recipient not found' });
    }

    const transaction = await createTransaction({
      userId: req.user.id,
      type: 'transfer',
      counterpartyUserId: recipientId,
      ...parsed,
    });

    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ msg: 'Unable to process transfer' });
  }
});

router.get('/history', auth, authorize('investor', 'entrepreneur'), async (req, res) => {
  try {
    const history = await Transaction.find({ user: req.user.id })
      .populate('counterpartyUserId', 'name email role')
      .sort({ createdAt: -1 });

    res.json(history);
  } catch (err) {
    res.status(500).json({ msg: 'Unable to fetch transaction history' });
  }
});

module.exports = router;
