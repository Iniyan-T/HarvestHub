import mongoose from 'mongoose';

const storageAlertSchema = new mongoose.Schema({
  batchId: {
    type: String,
    required: true,
    index: true
  },
  cropId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop',
    required: true
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  alertType: {
    type: String,
    enum: ['temperature', 'humidity', 'gas', 'spoilage_risk', 'device_offline'],
    required: true
  },
  severity: {
    type: String,
    enum: ['critical', 'warning', 'info'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  threshold: {
    parameter: String,
    expected: Number,
    actual: Number
  },
  currentReadings: {
    temperature: Number,
    humidity: Number,
    gasLevels: Object
  },
  recommendedAction: {
    type: String,
    default: ''
  },
  resolved: {
    type: Boolean,
    default: false
  },
  action: {
    type: String,
    default: null
  },
  resolvedAt: {
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
storageAlertSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('StorageAlert', storageAlertSchema);
