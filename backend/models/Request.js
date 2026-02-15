import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  buyerName: {
    type: String,
    required: true
  },
  buyerContact: {
    type: String,
    default: ''
  },
  cropId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop',
    default: null
  },
  cropName: {
    type: String,
    required: true
  },
  requestedQuantity: {
    type: Number,
    required: true,
    min: [0, 'Quantity cannot be negative']
  },
  offerPrice: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  totalAmount: {
    type: Number,
    default: function() {
      return this.requestedQuantity * this.offerPrice;
    }
  },
  paymentMethod: {
    type: String,
    enum: ['online', 'offline'],
    default: 'offline'
  },
  transportNeeded: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'denied', 'completed'],
    default: 'pending'
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
requestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Request', requestSchema);
