import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { analyzeCropImage } from './services/gemini.service.js';
import aiAssistant from './services/ai-assistant.service.js';
import Crop from './models/Crop.js';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/harvesthub')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Error:', err));

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configure Multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'crop-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  }
});

// API Endpoint: Upload, Analyze & Save Crop
app.post('/api/crops/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image uploaded' 
      });
    }

    const { cropType, quantity, price, farmerId } = req.body;
    
    if (!cropType || !quantity || !price) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: cropType, quantity, price' 
      });
    }

    console.log('📸 Analyzing image:', req.file.filename);
    
    // Analyze image with Gemini Vision API
    const aiGrade = await analyzeCropImage(req.file.path);
    
    console.log('✅ AI Analysis complete:', aiGrade.grade);

    // Save to MongoDB
    const newCrop = new Crop({
      farmerId: farmerId || '507f1f77bcf86cd799439011',
      cropName: cropType,
      quantity: parseFloat(quantity),
      price: parseFloat(price),
      imageUrl: `/uploads/${req.file.filename}`,
      aiGrade,
      status: 'Available',
      harvestDate: new Date()
    });

    await newCrop.save();
    console.log('💾 Crop saved to database:', newCrop._id);

    res.json({
      success: true,
      message: 'Crop analyzed and saved successfully',
      data: newCrop
    });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze crop'
    });
  }
});

// API Endpoint: Get all crops for a farmer
app.get('/api/crops/farmer/:farmerId', async (req, res) => {
  try {
    const crops = await Crop.find({ 
      farmerId: req.params.farmerId 
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: crops
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch crops'
    });
  }
});

// API Endpoint: Get all crops (for buyers later)
app.get('/api/crops', async (req, res) => {
  try {
    const { grade, status } = req.query;
    const filter = {};
    
    if (grade) filter['aiGrade.grade'] = grade;
    if (status) filter.status = status;

    const crops = await Crop.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: crops
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch crops'
    });
  }
});

// API Endpoint: Update crop
app.put('/api/crops/:cropId', async (req, res) => {
  try {
    const { quantity, price, status } = req.body;
    
    const updateData = {};
    if (quantity !== undefined) updateData.quantity = quantity;
    if (price !== undefined) updateData.price = price;
    if (status !== undefined) updateData.status = status;

    const crop = await Crop.findByIdAndUpdate(
      req.params.cropId,
      updateData,
      { new: true }
    );

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }

    res.json({
      success: true,
      message: 'Crop updated successfully',
      data: crop
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update crop'
    });
  }
});

// API Endpoint: Delete crop
app.delete('/api/crops/:cropId', async (req, res) => {
  try {
    const crop = await Crop.findByIdAndDelete(req.params.cropId);

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }

    res.json({
      success: true,
      message: 'Crop deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete crop'
    });
  }
});

// AI Assistant Routes
app.post('/api/ai-assistant/chat', async (req, res) => {
  try {
    const { message, userId, userType } = req.body;

    // Validation
    if (!message || !userId || !userType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: message, userId, userType'
      });
    }

    if (!['farmer', 'buyer'].includes(userType)) {
      return res.status(400).json({
        success: false,
        message: 'userType must be either "farmer" or "buyer"'
      });
    }

    // Call AI Assistant
    const result = await aiAssistant.chat(userId, userType, message);

    res.json(result);

  } catch (error) {
    console.error('❌ AI Chat Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process chat request',
      error: error.message
    });
  }
});

// Get quick suggestions
app.get('/api/ai-assistant/suggestions', async (req, res) => {
  try {
    const { userId, userType } = req.query;

    if (!userId || !userType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: userId, userType'
      });
    }

    const suggestions = await aiAssistant.getQuickSuggestions(userId, userType);

    res.json({
      success: true,
      suggestions
    });

  } catch (error) {
    console.error('❌ Suggestions Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get suggestions',
      error: error.message
    });
  }
});

// Clear conversation history
app.post('/api/ai-assistant/clear-history', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: userId'
      });
    }

    aiAssistant.clearHistory(userId);

    res.json({
      success: true,
      message: 'Conversation history cleared'
    });

  } catch (error) {
    console.error('❌ Clear History Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear history',
      error: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'HarvestHub API is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🤖 Gemini Vision API: ${process.env.GEMINI_API_KEY ? 'Configured' : 'NOT configured'}`);
});
