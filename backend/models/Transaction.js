import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseOrder',
    default: null
  },
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
    default: null
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  transactionId: {
    type: String,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'upi', 'check', 'cash', 'online', 'offline'],
    required: true
  },
  cropName: {
    type: String,
    default: ''
  },
  quantity: {
    type: Number,
    default: 0
  },
  transportNeeded: {
    type: Boolean,
    default: false
  },
  transactionType: {
    type: String,
    enum: ['payment', 'refund', 'adjustment'],
    default: 'payment'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending',
    index: true
  },
  paymentDate: Date,
  referenceNumber: String,
  bankDetails: {
    bankName: String,
    accountNumber: String,
    transferDate: Date
  },
  description: String,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Auto-generate transaction ID
transactionSchema.pre('save', async function(next) {
  if (!this.transactionId) {
    const count = await mongoose.model('Transaction').countDocuments();
    this.transactionId = `TXN-${Date.now()}-${count + 1}`;
  }
  next();
});

export default mongoose.model('Transaction', transactionSchema);
