import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import Wishlist from '../models/Wishlist.js';
import Crop from '../models/Crop.js';
import User from '../models/User.js';

const router = express.Router();

// Initialize/Get wishlist for a buyer
router.get('/', authenticate, authorize('buyer'), async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ buyerId: req.user._id })
      .populate('crops.cropId', 'cropName quantity price aiGrade imageUrl')
      .populate('crops.farmerId', 'name email phone')
      .populate('farmers.farmerId', 'name email phone');

    if (!wishlist) {
      wishlist = await Wishlist.create({ buyerId: req.user._id });
    }

    res.json({
      success: true,
      data: wishlist
    });
  } catch (error) {
    console.error('❌ Get Wishlist Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch wishlist'
    });
  }
});

// ADD: Add crop to wishlist
router.post('/crops/add', authenticate, authorize('buyer'), async (req, res) => {
  try {
    const { cropId } = req.body;

    if (!cropId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide cropId'
      });
    }

    const crop = await Crop.findById(cropId);
    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }

    let wishlist = await Wishlist.findOne({ buyerId: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        buyerId: req.user._id,
        crops: [{ cropId, farmerId: crop.farmerId, cropName: crop.cropName }]
      });
    } else {
      // Check if crop is already in wishlist
      const exists = wishlist.crops.some(item => item.cropId.toString() === cropId);
      if (exists) {
        return res.status(400).json({
          success: false,
          message: 'Crop is already in your wishlist'
        });
      }

      wishlist.crops.push({
        cropId,
        farmerId: crop.farmerId,
        cropName: crop.cropName
      });
      await wishlist.save();
    }

    await wishlist.populate('crops.cropId', 'cropName quantity price aiGrade imageUrl');

    res.status(201).json({
      success: true,
      message: 'Crop added to wishlist',
      data: wishlist
    });
  } catch (error) {
    console.error('❌ Add to Wishlist Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add crop to wishlist'
    });
  }
});

// REMOVE: Remove crop from wishlist
router.post('/crops/remove', authenticate, authorize('buyer'), async (req, res) => {
  try {
    const { cropId } = req.body;

    if (!cropId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide cropId'
      });
    }

    const wishlist = await Wishlist.findOne({ buyerId: req.user._id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    wishlist.crops = wishlist.crops.filter(item => item.cropId.toString() !== cropId);
    await wishlist.save();

    res.json({
      success: true,
      message: 'Crop removed from wishlist',
      data: wishlist
    });
  } catch (error) {
    console.error('❌ Remove from Wishlist Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to remove crop from wishlist'
    });
  }
});

// ADD: Add farmer to wishlist
router.post('/farmers/add', authenticate, authorize('buyer'), async (req, res) => {
  try {
    const { farmerId } = req.body;

    if (!farmerId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide farmerId'
      });
    }

    const farmer = await User.findById(farmerId);
    if (!farmer || farmer.role !== 'farmer') {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    let wishlist = await Wishlist.findOne({ buyerId: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        buyerId: req.user._id,
        farmers: [{ farmerId, farmerName: farmer.name }]
      });
    } else {
      // Check if farmer is already in wishlist
      const exists = wishlist.farmers.some(item => item.farmerId.toString() === farmerId);
      if (exists) {
        return res.status(400).json({
          success: false,
          message: 'Farmer is already in your wishlist'
        });
      }

      wishlist.farmers.push({
        farmerId,
        farmerName: farmer.name
      });
      await wishlist.save();
    }

    res.status(201).json({
      success: true,
      message: 'Farmer added to wishlist',
      data: wishlist
    });
  } catch (error) {
    console.error('❌ Add Farmer to Wishlist Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add farmer to wishlist'
    });
  }
});

// REMOVE: Remove farmer from wishlist
router.post('/farmers/remove', authenticate, authorize('buyer'), async (req, res) => {
  try {
    const { farmerId } = req.body;

    if (!farmerId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide farmerId'
      });
    }

    const wishlist = await Wishlist.findOne({ buyerId: req.user._id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    wishlist.farmers = wishlist.farmers.filter(item => item.farmerId.toString() !== farmerId);
    await wishlist.save();

    res.json({
      success: true,
      message: 'Farmer removed from wishlist',
      data: wishlist
    });
  } catch (error) {
    console.error('❌ Remove Farmer from Wishlist Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to remove farmer from wishlist'
    });
  }
});

export default router;
