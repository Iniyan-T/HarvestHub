import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    index: true
  },
  totalUsers: {
    type: Number,
    default: 0
  },
  activeUsers: {
    type: Number,
    default: 0
  },
  totalFarmers: {
    type: Number,
    default: 0
  },
  totalBuyers: {
    type: Number,
    default: 0
  },
  totalCrops: {
    type: Number,
    default: 0
  },
  availableCrops: {
    type: Number,
    default: 0
  },
  soldCrops: {
    type: Number,
    default: 0
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  completedOrders: {
    type: Number,
    default: 0
  },
  pendingOrders: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  avgOrderValue: {
    type: Number,
    default: 0
  },
  commissionsCollected: {
    type: Number,
    default: 0
  },
  topCrops: [
    {
      cropName: String,
      count: Number,
      revenue: Number
    }
  ],
  topFarmers: [
    {
      farmerId: mongoose.Schema.Types.ObjectId,
      farmName: String,
      ordersCount: Number,
      revenue: Number,
      rating: Number
    }
  ],
  topBuyers: [
    {
      buyerId: mongoose.Schema.Types.ObjectId,
      buyerName: String,
      ordersCount: Number,
      spent: Number
    }
  ],
  paymentMetrics: {
    totalPayments: Number,
    successfulPayments: Number,
    failedPayments: Number,
    paymentMethods: {
      online: Number,
      bankTransfer: Number,
      cod: Number
    }
  },
  qualityMetrics: {
    avgGradeA: Number,
    avgGradeB: Number,
    avgGradeC: Number,
    avgConfidenceScore: Number
  },
  transportMetrics: {
    totalDeliveries: Number,
    successfulDeliveries: Number,
    avgDeliveryTime: Number
  },
  storageMetrics: {
    totalStorageBatches: Number,
    criticalAlerts: Number,
    warningAlerts: Number
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

export default mongoose.model('Analytics', analyticsSchema);
