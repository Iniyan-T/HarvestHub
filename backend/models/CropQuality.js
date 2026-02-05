import mongoose from 'mongoose';

const cropQualitySchema = new mongoose.Schema({
  cropId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop',
    required: true,
    index: true
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  batchId: {
    type: String,
    unique: true,
    required: true
  },
  grade: {
    type: String,
    enum: ['A', 'B', 'C', 'Pending'],
    default: 'Pending'
  },
  confidenceScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  qualityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  defects: {
    type: [String],
    default: []
  },
  freshness: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Unknown'],
    default: 'Unknown'
  },
  aiRemarks: {
    type: String,
    default: ''
  },
  imageRefs: {
    type: [String],
    default: []
  },
  modelUsed: {
    type: String,
    enum: ['gemini', 'ollama', 'pending'],
    default: 'pending'
  },
  analyzedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt on save
cropQualitySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('CropQuality', cropQualitySchema);
