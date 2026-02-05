import mongoose from 'mongoose';

const transportSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseOrder',
    required: true,
    unique: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transportProvider: {
    name: String,
    phone: String,
    vehicleNumber: String,
    vehicleType: String,
    licenseNumber: String
  },
  pickupLocation: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    latitude: Number,
    longitude: Number
  },
  deliveryLocation: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    latitude: Number,
    longitude: Number
  },
  pickupDate: Date,
  estimatedDeliveryDate: Date,
  estimatedETA: {
    hours: Number,
    minutes: Number,
    distanceKm: Number,
    calculatedAt: Date
  },
  actualDeliveryDate: Date,
  status: {
    type: String,
    enum: ['pending', 'scheduled', 'in_transit', 'delivered', 'cancelled', 'delayed'],
    default: 'pending',
    index: true
  },
  currentLocation: {
    latitude: Number,
    longitude: Number,
    updatedAt: Date
  },
  temperature: Number, // For cold chain logistics
  humidity: Number,    // For quality maintenance
  photos: [String],    // Delivery photos
  signature: String,   // Delivery signature
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

export default mongoose.model('Transport', transportSchema);
