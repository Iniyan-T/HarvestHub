import express from 'express';
import User from '../models/User.js';
import BuyerProfile from '../models/BuyerProfile.js';
import FarmerProfile from '../models/FarmerProfile.js';
import { generateToken, authenticate } from '../middleware/auth.js';

const router = express.Router();

// Register a new user (buyer or farmer)
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword, role, address } = req.body;

    // Validation
    if (!name || !email || !phone || !password || !confirmPassword || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or phone already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role,
      address
    });

    // Create profile based on role
    if (role === 'buyer') {
      await BuyerProfile.create({
        userId: user._id
      });
    } else if (role === 'farmer') {
      await FarmerProfile.create({
        userId: user._id
      });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Registration Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.matchPassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated'
      });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Login Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Login failed'
    });
  }
});

// Get current user profile
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    let profile = null;
    if (user.role === 'buyer') {
      profile = await BuyerProfile.findOne({ userId: user._id });
    } else if (user.role === 'farmer') {
      profile = await FarmerProfile.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        isActive: user.isActive
      },
      profile
    });
  } catch (error) {
    console.error('❌ Get Profile Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch profile'
    });
  }
});

// Update user profile
router.put('/update-profile', authenticate, async (req, res) => {
  try {
    const { name, phone, address, profileImage } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (profileImage) updateData.profileImage = profileImage;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('❌ Update Profile Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile'
    });
  }
});

// Update buyer profile
router.put('/buyer/update-profile', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'buyer') {
      return res.status(403).json({
        success: false,
        message: 'Only buyers can update buyer profile'
      });
    }

    const buyerProfile = await BuyerProfile.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Buyer profile updated successfully',
      profile: buyerProfile
    });
  } catch (error) {
    console.error('❌ Update Buyer Profile Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update buyer profile'
    });
  }
});

// Update farmer profile
router.put('/farmer/update-profile', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'farmer') {
      return res.status(403).json({
        success: false,
        message: 'Only farmers can update farmer profile'
      });
    }

    const farmerProfile = await FarmerProfile.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Farmer profile updated successfully',
      profile: farmerProfile
    });
  } catch (error) {
    console.error('❌ Update Farmer Profile Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update farmer profile'
    });
  }
});

// Change password
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match'
      });
    }

    // Get user with password field
    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isPasswordValid = await user.matchPassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('❌ Change Password Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to change password'
    });
  }
});

export default router;
