import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import Transport from '../models/Transport.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import User from '../models/User.js';

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

// CREATE: Schedule transport for an order
router.post('/schedule', authenticate, authorize('farmer'), async (req, res) => {
  try {
    const { orderId, pickupDate, transportProvider, pickupLocation, deliveryLocation } = req.body;

    if (!orderId || !pickupDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide orderId and pickupDate'
      });
    }

    // Verify order exists and get locations
    const order = await PurchaseOrder.findById(orderId)
      .populate('farmerId', 'address')
      .populate('buyerId', 'address');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.farmerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to schedule transport for this order'
      });
    }

    // Use provided locations or default to user addresses
    const pickup = pickupLocation || {
      address: order.farmerId.address?.street || '',
      city: order.farmerId.address?.city || '',
      state: order.farmerId.address?.state || '',
      zipCode: order.farmerId.address?.zipCode || '',
      latitude: order.farmerId.address?.latitude,
      longitude: order.farmerId.address?.longitude
    };

    const delivery = deliveryLocation || {
      address: order.buyerId.address?.street || '',
      city: order.buyerId.address?.city || '',
      state: order.buyerId.address?.state || '',
      zipCode: order.buyerId.address?.zipCode || '',
      latitude: order.buyerId.address?.latitude,
      longitude: order.buyerId.address?.longitude
    };

    // Calculate ETA based on coordinates
    const eta = calculateETA(
      pickup.latitude,
      pickup.longitude,
      delivery.latitude,
      delivery.longitude
    );

    const estimatedDeliveryDate = new Date(pickupDate);
    if (eta) {
      estimatedDeliveryDate.setHours(estimatedDeliveryDate.getHours() + eta.hours);
      estimatedDeliveryDate.setMinutes(estimatedDeliveryDate.getMinutes() + eta.minutes);
    }

    const transport = await Transport.create({
      orderId,
      buyerId: order.buyerId._id,
      farmerId: order.farmerId._id,
      transportProvider,
      pickupLocation: pickup,
      deliveryLocation: delivery,
      pickupDate,
      estimatedDeliveryDate,
      estimatedETA: eta ? {
        ...eta,
        calculatedAt: new Date()
      } : null
    });

    // Update order status
    order.status = 'ready_for_delivery';
    order.expectedDeliveryDate = estimatedDeliveryDate;
    await order.save();

    res.status(201).json({
      success: true,
      message: 'Transport scheduled successfully',
      data: transport
    });
  } catch (error) {
    console.error('❌ Schedule Transport Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to schedule transport'
    });
  }
});

// READ: Get transport details for an order
router.get('/order/:orderId', authenticate, async (req, res) => {
  try {
    const transport = await Transport.findOne({ orderId: req.params.orderId })
      .populate('buyerId', 'name email phone')
      .populate('farmerId', 'name email phone');

    if (!transport) {
      return res.status(404).json({
        success: false,
        message: 'Transport details not found'
      });
    }

    res.json({
      success: true,
      data: transport
    });
  } catch (error) {
    console.error('❌ Get Transport Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch transport details'
    });
  }
});

// UPDATE: Update transport status (manual update)
router.put('/:transportId/status', authenticate, authorize('farmer'), async (req, res) => {
  try {
    const { status, currentLocation, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide status'
      });
    }

    const transport = await Transport.findById(req.params.transportId);

    if (!transport) {
      return res.status(404).json({
        success: false,
        message: 'Transport not found'
      });
    }

    if (transport.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this transport'
      });
    }

    transport.status = status;

    if (currentLocation) {
      transport.currentLocation = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        updatedAt: new Date()
      };
    }

    if (notes) {
      transport.notes = notes;
    }

    if (status === 'delivered') {
      transport.actualDeliveryDate = new Date();
      
      // Update order status
      const order = await PurchaseOrder.findById(transport.orderId);
      if (order) {
        order.status = 'delivered';
        order.deliveryDate = new Date();
        order.paymentStatus = 'completed';
        await order.save();
      }
    } else if (status === 'in_transit') {
      // Update order status
      const order = await PurchaseOrder.findById(transport.orderId);
      if (order) {
        order.status = 'in_transit';
        await order.save();
      }
    }

    await transport.save();

    res.json({
      success: true,
      message: 'Transport status updated successfully',
      data: transport
    });
  } catch (error) {
    console.error('❌ Update Transport Status Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update transport status'
    });
  }
});

// UPDATE: Add environmental monitoring data
router.put('/:transportId/monitoring', authenticate, authorize('farmer'), async (req, res) => {
  try {
    const { temperature, humidity, photos } = req.body;

    const transport = await Transport.findById(req.params.transportId);

    if (!transport) {
      return res.status(404).json({
        success: false,
        message: 'Transport not found'
      });
    }

    if (transport.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this transport'
      });
    }

    if (temperature !== undefined) transport.temperature = temperature;
    if (humidity !== undefined) transport.humidity = humidity;
    if (photos) transport.photos = photos;

    await transport.save();

    res.json({
      success: true,
      message: 'Monitoring data updated successfully',
      data: transport
    });
  } catch (error) {
    console.error('❌ Update Monitoring Data Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update monitoring data'
    });
  }
});

// READ: Get all transports for a farmer
router.get('/farmer/my-transports', authenticate, authorize('farmer'), async (req, res) => {
  try {
    const { status, skip = 0, limit = 10 } = req.query;

    const filter = { farmerId: req.user._id };
    if (status) filter.status = status;

    const transports = await Transport.find(filter)
      .populate('orderId', 'orderNumber totalAmount crop_id')
      .populate('buyerId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Transport.countDocuments(filter);

    res.json({
      success: true,
      data: transports,
      pagination: {
        total,
        skip: parseInt(skip),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('❌ Get Farmer Transports Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch transports'
    });
  }
});

// READ: Get all transports for a buyer
router.get('/buyer/my-transports', authenticate, authorize('buyer'), async (req, res) => {
  try {
    const { status, skip = 0, limit = 10 } = req.query;

    const filter = { buyerId: req.user._id };
    if (status) filter.status = status;

    const transports = await Transport.find(filter)
      .populate('orderId', 'orderNumber totalAmount')
      .populate('farmerId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Transport.countDocuments(filter);

    res.json({
      success: true,
      data: transports,
      pagination: {
        total,
        skip: parseInt(skip),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('❌ Get Buyer Transports Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch transports'
    });
  }
});

// READ: Get transports by user ID (for URL-based access)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, skip = 0, limit = 50 } = req.query;

    if (!userId || userId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Valid user ID is required'
      });
    }

    const filter = {
      $or: [
        { farmerId: userId },
        { buyerId: userId }
      ]
    };
    if (status) filter.status = status;

    const transports = await Transport.find(filter)
      .populate('orderId', 'orderNumber totalAmount')
      .populate('buyerId', 'name email phone')
      .populate('farmerId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Transport.countDocuments(filter);

    res.json({
      success: true,
      data: transports,
      pagination: {
        total,
        skip: parseInt(skip),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching user transports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transports'
    });
  }
});

export default router;
