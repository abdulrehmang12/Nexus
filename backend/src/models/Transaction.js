const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  counterpartyUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  type: { type: String, enum: ['deposit', 'withdraw', 'transfer'], required: true },
  provider: { type: String, enum: ['stripe', 'paypal'], default: 'stripe' },
  paymentMethod: { type: String, default: 'sandbox' },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  reference: { type: String },
  providerSessionId: { type: String, default: '' },
  note: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
