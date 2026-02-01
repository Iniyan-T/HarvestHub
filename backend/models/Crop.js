import mongoose from 'mongoose';

const cropSchema = new mongoose.Schema({
  farmerId: {
    type: String,
    required: true
  },
  cropName: {
    type: String,
    required: [true, 'Crop name is required'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  imageUrl: {
    type: String,
    required: [true, 'Image is required']
  },
  aiGrade: {
    grade: {
      type: String,
      enum: ['A', 'B', 'C', 'Pending'],
      default: 'Pending'
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100
    },
    qualityScore: {
      type: Number,
      min: 0,
      max: 100
    },
    defects: [String],
    freshness: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Unknown'],
      default: 'Unknown'
    },
    analysis: String,
    analyzedAt: Date
  },
  status: {
    type: String,
    enum: ['Available', 'Sold', 'Reserved', 'Expired'],
    default: 'Available'
  },
  location: {
    type: String,
    trim: true
  },
  harvestDate: {
    type: Date
  }
}, {
  timestamps: true
});

const Crop = mongoose.model('Crop', cropSchema);

export default Crop;
