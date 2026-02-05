import mongoose from 'mongoose';

const pricePredictionSchema = new mongoose.Schema({
  cropType: {
    type: String,
    required: true,
    index: true
  },
  currentPrice: {
    type: Number,
    required: true
  },
  predictedPrice: {
    type: Number,
    required: true
  },
  trend: {
    type: String,
    enum: ['up', 'down', 'stable'],
    default: 'stable'
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  bestSellTime: {
    type: String,
    default: 'Now'
  },
  priceChangePercent: {
    type: Number,
    default: 0
  },
  data: {
    historicalData: [
      {
        date: Date,
        price: Number
      }
    ],
    dataPoints: {
      type: Number,
      default: 0
    }
  },
  modelUsed: {
    type: String,
    enum: ['gemini', 'ollama', 'statistical'],
    default: 'statistical'
  },
  nextUpdate: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
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
pricePredictionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('PricePrediction', pricePredictionSchema);
