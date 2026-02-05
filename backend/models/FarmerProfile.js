import mongoose from 'mongoose';

const farmerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  farmName: {
    type: String,
    required: true
  },
  farmSize: {
    type: Number, // in acres
    required: true
  },
  farmLicense: String,
  soilType: String,
  irrigationType: [String],
  cropsProduced: [String],
  yearsOfExperience: Number,
  bank: String,
  governmentId: String,
  totalCropsListed: {
    type: Number,
    default: 0
  },
  totalSales: {
    type: Number,
    default: 0
  },
  totalEarnings: {
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
  certifications: [String],
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

export default mongoose.model('FarmerProfile', farmerProfileSchema);
