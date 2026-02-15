import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import Transaction from '../models/Transaction.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import BuyerProfile from '../models/BuyerProfile.js';
import FarmerProfile from '../models/FarmerProfile.js';

const router = express.Router();

// CREATE: Record a payment transaction
router.post('/record-payment', authenticate, authorize('buyer'), async (req, res) => {
  try {
    const { orderId, paymentMethod, amount, referenceNumber, bankDetails } = req.body;

    if (!orderId || !paymentMethod || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide orderId, paymentMethod, and amount'
      });
    }

    // Verify order exists
    const order = await PurchaseOrder.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to pay for this order'
      });
    }

    // Check if payment exceeds order amount
    if (amount > order.totalAmount) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount cannot exceed order total'
      });
    }

    const transaction = await Transaction.create({
      orderId,
      buyerId: req.user._id,
      farmerId: order.farmerId,
      amount,
      paymentMethod,
      transactionType: 'payment',
      status: 'completed',
      paymentDate: new Date(),
      referenceNumber,
      bankDetails,
      description: `Payment for order ${order.orderNumber}`
    });

    // Update order payment status
    order.amountPaid += amount;
    if (order.amountPaid >= order.totalAmount) {
      order.paymentStatus = 'completed';
      order.status = 'payment_confirmed';
    } else {
      order.paymentStatus = 'partial';
      order.status = 'payment_pending';
    }
    await order.save();

    // Update buyer profile total spent
    await BuyerProfile.findOneAndUpdate(
      { userId: req.user._id },
      { 
        $inc: { totalSpent: amount, totalOrders: 1 }
      }
    );

    // Update farmer profile total earnings
    await FarmerProfile.findOneAndUpdate(
      { userId: order.farmerId },
      { 
        $inc: { totalEarnings: amount, totalSales: 1 }
      }
    );

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: transaction
    });
  } catch (error) {
    console.error('❌ Record Payment Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to record payment'
    });
  }
});

// READ: Get all transactions for a user
router.get('/my-transactions', authenticate, async (req, res) => {
  try {
    const { skip = 0, limit = 10, status } = req.query;

    const filter = {
      $or: [
        { buyerId: req.user._id },
        { farmerId: req.user._id }
      ]
    };

    if (status) filter.status = status;

    const transactions = await Transaction.find(filter)
      .populate('orderId', 'orderNumber totalAmount')
      .populate('buyerId', 'name email phone')
      .populate('farmerId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(filter);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        total,
        skip: parseInt(skip),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('❌ Get Transactions Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch transactions'
    });
  }
});

// READ: Get transactions by user ID (for URL-based access)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { skip = 0, limit = 50, status } = req.query;

    if (!userId || userId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Valid user ID is required'
      });
    }

    const filter = {
      $or: [
        { buyerId: userId },
        { farmerId: userId }
      ]
    };

    if (status) filter.status = status;

    const transactions = await Transaction.find(filter)
      .populate('orderId', 'orderNumber totalAmount')
      .populate('buyerId', 'name email phone')
      .populate('farmerId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(filter);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        total,
        skip: parseInt(skip),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions'
    });
  }
});

// READ: Get transaction details
router.get('/:transactionId', authenticate, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.transactionId)
      .populate('orderId')
      .populate('buyerId', 'name email phone')
      .populate('farmerId', 'name email phone');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Verify authorization
    if (transaction.buyerId._id.toString() !== req.user._id.toString() &&
        transaction.farmerId._id.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this transaction'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('❌ Get Transaction Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch transaction'
    });
  }
});

// GET: Transaction statistics for a user
router.get('/stats/summary', authenticate, async (req, res) => {
  try {
    const stats = await Transaction.aggregate([
      {
        $match: {
          $or: [
            { buyerId: req.user._id },
            { farmerId: req.user._id }
          ]
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalTransactions: { $sum: 1 },
          completedTransactions: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          pendingTransactions: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          failedTransactions: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: stats[0] || {
        totalAmount: 0,
        totalTransactions: 0,
        completedTransactions: 0,
        pendingTransactions: 0,
        failedTransactions: 0
      }
    });
  } catch (error) {
    console.error('❌ Get Stats Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch statistics'
    });
  }
});

// ADMIN: Get all transactions
router.get('/admin/all-transactions', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { skip = 0, limit = 20, status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const transactions = await Transaction.find(filter)
      .populate('orderId', 'orderNumber totalAmount')
      .populate('buyerId', 'name email phone')
      .populate('farmerId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(filter);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        total,
        skip: parseInt(skip),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('❌ Admin Get Transactions Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch transactions'
    });
  }
});

export default router;
