import mongoose from 'mongoose';

const storageReadingSchema = new mongoose.Schema({
  batchId: {
    type: String,
    required: true,
    index: true
  },
  cropId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop',
    required: false  // Optional - can be added later when linked to crop
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false  // Optional - can default to a test farmer
  },
  temperature: {
    type: Number,
    required: true,
    min: -50,
    max: 60
  },
  humidity: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  gasLevel: {
    co2: {
      type: Number,
      default: 0
    },
    o2: {
      type: Number,
      default: 0
    },
    ethylene: {
      type: Number,
      default: 0
    }
  },
  deviceId: {
    type: String,
    required: true
  },
  location: {
    type: String,
    default: 'Cold Storage'
  },
  status: {
    type: String,
    enum: ['normal', 'warning', 'critical', 'offline'],
    default: 'normal'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Auto-delete readings older than 90 days
storageReadingSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

export default mongoose.model('StorageReading', storageReadingSchema);
