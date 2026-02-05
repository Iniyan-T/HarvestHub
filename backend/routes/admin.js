import express from 'express';
import ApiLog from '../models/ApiLog.js';
import Analytics from '../models/Analytics.js';
import User from '../models/User.js';
import Crop from '../models/Crop.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import Transaction from '../models/Transaction.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Middleware to verify admin role
const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Unauthorized: Admin access required'
    });
  }
};

// ===== API LOGS =====

// GET API logs (admin only)
router.get('/logs', authenticate, verifyAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const skip = parseInt(req.query.skip) || 0;
    const endpoint = req.query.endpoint || '';
    const userRole = req.query.userRole || '';

    const query = {};
    if (endpoint) query.endpoint = { $regex: endpoint, $options: 'i' };
    if (userRole) query.userRole = userRole;

    const logs = await ApiLog.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .populate('userId', 'name email');

    const total = await ApiLog.countDocuments(query);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        total,
        limit,
        skip
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching API logs',
      error: error.message
    });
  }
});

// GET API log statistics
router.get('/logs/stats', authenticate, verifyAdmin, async (req, res) => {
  try {
    const stats = await ApiLog.aggregate([
      {
        $group: {
          _id: '$endpoint',
          count: { $sum: 1 },
          avgResponseTime: { $avg: '$responseTime' },
          errors: {
            $sum: { $cond: [{ $ne: ['$errorMessage', null] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching API statistics',
      error: error.message
    });
  }
});

// POST log API call (middleware compatible)
router.post('/logs', async (req, res) => {
  try {
    const {
      endpoint,
      method,
      statusCode,
      responseTime,
      userId,
      userRole,
      ipAddress,
      errorMessage,
      success
    } = req.body;

    if (!endpoint || !method || !statusCode || responseTime === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const newLog = new ApiLog({
      endpoint,
      method,
      statusCode,
      responseTime,
      userId: userId || null,
      userRole: userRole || 'guest',
      ipAddress: ipAddress || 'unknown',
      errorMessage: errorMessage || null,
      success: success !== undefined ? success : statusCode < 400
    });

    await newLog.save();

    res.status(201).json({
      success: true,
      message: 'API log recorded'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error saving API log',
      error: error.message
    });
  }
});

// ===== ANALYTICS =====

// GET daily analytics
router.get('/analytics/:date', authenticate, verifyAdmin, async (req, res) => {
  try {
    const date = new Date(req.params.date);
    date.setHours(0, 0, 0, 0);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const analytics = await Analytics.findOne({
      date: { $gte: date, $lt: nextDate }
    });

    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: 'Analytics data not found for this date'
      });
    }

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
});

// GET latest analytics
router.get('/analytics/latest', authenticate, verifyAdmin, async (req, res) => {
  try {
    const analytics = await Analytics.findOne()
      .sort({ date: -1 });

    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: 'No analytics data available'
      });
    }

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching latest analytics',
      error: error.message
    });
  }
});

// GET analytics range
router.get('/analytics/range', authenticate, verifyAdmin, async (req, res) => {
  try {
    const { startDate, endDate, limit } = req.query;
    const pageLimit = parseInt(limit) || 30;

    const query = {};
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const analytics = await Analytics.find(query)
      .sort({ date: -1 })
      .limit(pageLimit);

    res.status(200).json({
      success: true,
      count: analytics.length,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics range',
      error: error.message
    });
  }
});

// POST generate/calculate daily analytics (call this daily)
router.post('/analytics/generate', authenticate, verifyAdmin, async (req, res) => {
  try {
    const now = new Date();
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);

    // Check if analytics already exist for today
    let analytics = await Analytics.findOne({
      date: { $gte: date, $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000) }
    });

    // Get all metrics
    const totalUsers = await User.countDocuments();
    const totalFarmers = await User.countDocuments({ role: 'farmer' });
    const totalBuyers = await User.countDocuments({ role: 'buyer' });
    const totalCrops = await Crop.countDocuments();
    const availableCrops = await Crop.countDocuments({ status: 'available' });
    const soldCrops = await Crop.countDocuments({ status: 'sold' });
    const totalOrders = await PurchaseOrder.countDocuments();
    const completedOrders = await PurchaseOrder.countDocuments({ status: 'delivered' });
    const pendingOrders = await PurchaseOrder.countDocuments({ status: 'pending' });

    const orderStats = await PurchaseOrder.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    const totalRevenue = orderStats[0]?.totalRevenue || 0;
    const avgOrderValue = orderStats[0]?.avgOrderValue || 0;

    if (analytics) {
      // Update existing
      analytics.totalUsers = totalUsers;
      analytics.totalFarmers = totalFarmers;
      analytics.totalBuyers = totalBuyers;
      analytics.totalCrops = totalCrops;
      analytics.availableCrops = availableCrops;
      analytics.soldCrops = soldCrops;
      analytics.totalOrders = totalOrders;
      analytics.completedOrders = completedOrders;
      analytics.pendingOrders = pendingOrders;
      analytics.totalRevenue = totalRevenue;
      analytics.avgOrderValue = avgOrderValue;
    } else {
      // Create new
      analytics = new Analytics({
        date,
        totalUsers,
        totalFarmers,
        totalBuyers,
        totalCrops,
        availableCrops,
        soldCrops,
        totalOrders,
        completedOrders,
        pendingOrders,
        totalRevenue,
        avgOrderValue
      });
    }

    await analytics.save();

    res.status(analytics.isNew ? 201 : 200).json({
      success: true,
      message: `Analytics ${analytics.isNew ? 'created' : 'updated'}`,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating analytics',
      error: error.message
    });
  }
});

// GET system health summary
router.get('/system/health', authenticate, verifyAdmin, async (req, res) => {
  try {
    const errorLogsLast24h = await ApiLog.countDocuments({
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      success: false
    });

    const avgResponseTime = await ApiLog.aggregate([
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$responseTime' }
        }
      }
    ]);

    const totalApiCalls = await ApiLog.countDocuments({
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    const health = {
      status: errorLogsLast24h === 0 ? 'healthy' : 'degraded',
      errorRate: totalApiCalls > 0 ? (errorLogsLast24h / totalApiCalls) * 100 : 0,
      avgResponseTime: Math.round(avgResponseTime[0]?.avgTime || 0),
      apiCallsLast24h: totalApiCalls,
      errorsLast24h: errorLogsLast24h
    };

    res.status(200).json({
      success: true,
      data: health
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching system health',
      error: error.message
    });
  }
});

export default router;
