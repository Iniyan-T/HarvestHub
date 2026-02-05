import mongoose from 'mongoose';

const buyerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  companyName: String,
  companyType: {
    type: String,
    enum: ['Retailer', 'Distributor', 'Wholesaler', 'Processor', 'Individual'],
    default: 'Individual'
  },
  businessRegistration: String,
  taxId: String,
  businessLicense: String,
  preferredCrops: [String],
  averageOrderValue: {
    type: Number,
    default: 0
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  bankDetails: {
    accountHolder: String,
    accountNumber: String,
    bankName: String,
    ifscCode: String
  },
  upiId: String,
  preferredPaymentMethod: {
    type: String,
    enum: ['bank_transfer', 'upi', 'check'],
    default: 'bank_transfer'
  },
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

export default mongoose.model('BuyerProfile', buyerProfileSchema);
