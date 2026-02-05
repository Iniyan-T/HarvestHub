import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import Crop from '../models/Crop.js';
import User from '../models/User.js';
import Message from '../models/Message.js';
import Wishlist from '../models/Wishlist.js';
import Transport from '../models/Transport.js';
import Transaction from '../models/Transaction.js';

const router = express.Router();

// Helper function to calculate ETA based on location
const calculateETA = (pickupLat, pickupLng, deliveryLat, deliveryLng) => {
  if (!pickupLat || !pickupLng || !deliveryLat || !deliveryLng) {
    return null;
  }

  // Haversine formula for distance calculation (in km)
  const R = 6371; // Earth's radius in km
  const dLat = (deliveryLat - pickupLat) * Math.PI / 180;
  const dLng = (deliveryLng - pickupLng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(pickupLat * Math.PI / 180) * Math.cos(deliveryLat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Assume 50 km/h average speed for rural transport
  const totalHours = distance / 50;
  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);

  return {
    distanceKm: Math.round(distance * 100) / 100,
    hours,
    minutes
  };
};

// CREATE: Buyer sends purchase request to farmer
router.post('/orders/create', authenticate, authorize('buyer'), async (req, res) => {
  try {
    const { farmerId, cropId, quantity, unit, pricePerUnit, quality, notes } = req.body;

    if (!farmerId || !cropId || !quantity || !pricePerUnit) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Verify crop exists and get farmer location
    const crop = await Crop.findById(cropId);
    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }

    // Verify farmer exists
    const farmer = await User.findById(farmerId);
    if (!farmer || farmer.role !== 'farmer') {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    const totalAmount = quantity * pricePerUnit;

    const order = await PurchaseOrder.create({
      buyerId: req.user._id,
      farmerId,
      cropId,
      quantity,
      unit: unit || 'kg',
      pricePerUnit,
      totalAmount,
      quality,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Purchase order created successfully',
      order
    });
  } catch (error) {
    console.error('❌ Create Order Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create purchase order'
    });
  }
});

// READ: Get all orders for a buyer
router.get('/orders/my-orders', authenticate, authorize('buyer'), async (req, res) => {
  try {
    const { status, skip = 0, limit = 10 } = req.query;

    const filter = { buyerId: req.user._id };
    if (status) filter.status = status;

    const orders = await PurchaseOrder.find(filter)
      .populate('farmerId', 'name email phone address')
      .populate('cropId', 'cropName quantity price aiGrade')
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await PurchaseOrder.countDocuments(filter);

    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        skip: parseInt(skip),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('❌ Get Orders Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch orders'
    });
  }
});

// READ: Get single order details
router.get('/orders/:orderId', authenticate, async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.orderId)
      .populate('buyerId', 'name email phone address')
      .populate('farmerId', 'name email phone address')
      .populate('cropId', 'cropName quantity price aiGrade imageUrl');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    if (order.buyerId._id.toString() !== req.user._id.toString() && 
        order.farmerId._id.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this order'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('❌ Get Order Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch order'
    });
  }
});

// UPDATE: Buyer can update order notes before farmer accepts
router.put('/orders/:orderId/update', authenticate, authorize('buyer'), async (req, res) => {
  try {
    const { notes, quantity, pricePerUnit } = req.body;

    const order = await PurchaseOrder.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this order'
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only update pending orders'
      });
    }

    if (quantity) {
      order.quantity = quantity;
    }
    if (pricePerUnit) {
      order.pricePerUnit = pricePerUnit;
      order.totalAmount = order.quantity * order.pricePerUnit;
    }
    if (notes) {
      order.notes = notes;
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order updated successfully',
      order
    });
  } catch (error) {
    console.error('❌ Update Order Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update order'
    });
  }
});

// FARMER ACTION: Accept order
router.put('/orders/:orderId/accept', authenticate, authorize('farmer'), async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to accept this order'
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only accept pending orders'
      });
    }

    order.status = 'accepted';
    order.acceptedAt = new Date();
    await order.save();

    res.json({
      success: true,
      message: 'Order accepted successfully',
      order
    });
  } catch (error) {
    console.error('❌ Accept Order Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to accept order'
    });
  }
});

// FARMER ACTION: Reject order
router.put('/orders/:orderId/reject', authenticate, authorize('farmer'), async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await PurchaseOrder.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to reject this order'
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only reject pending orders'
      });
    }

    order.status = 'rejected';
    order.rejectedAt = new Date();
    order.farmerNotes = reason || '';
    await order.save();

    res.json({
      success: true,
      message: 'Order rejected successfully',
      order
    });
  } catch (error) {
    console.error('❌ Reject Order Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reject order'
    });
  }
});

export default router;
