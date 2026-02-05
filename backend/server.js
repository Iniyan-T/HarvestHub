import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import{ analyzeCropImage } from './services/gemini.service.js';
import aiAssistant from './services/ai-assistant.service.js';
import Crop from './models/Crop.js';
import Request from './models/Request.js';
import User from './models/User.js';
import FarmerProfile from './models/FarmerProfile.js';
import BuyerProfile from './models/BuyerProfile.js';
import PurchaseOrder from './models/PurchaseOrder.js';
import Transport from './models/Transport.js';
import Message from './models/Message.js';
import Transaction from './models/Transaction.js';
import Wishlist from './models/Wishlist.js';
import CropQuality from './models/CropQuality.js';
import PricePrediction from './models/PricePrediction.js';
import StorageReading from './models/StorageReading.js';
import StorageAlert from './models/StorageAlert.js';
import Notification from './models/Notification.js';
import ApiLog from './models/ApiLog.js';
import Analytics from './models/Analytics.js';
import fs from 'fs';

// Import Routes
import authRoutes from './routes/auth.js';
import buyerRoutes from './routes/buyer.js';
import messagesRoutes from './routes/messages.js';
import wishlistRoutes from './routes/wishlist.js';
import transportRoutes from './routes/transport.js';
import transactionsRoutes from './routes/transactions.js';
import qualityRoutes from './routes/quality.js';
import storageRoutes from './routes/storage.js';
import notificationsRoutes from './routes/notifications.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB Connection - Using provided MongoDB URL
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://jagaveeravishnut:qwertyuiop@harvesthub.m09io3e.mongodb.net/?appName=HarvestHub';
mongoose.connect(MONGODB_URI)
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

// ==================== FARMER MANAGEMENT ROUTES ====================

// API Endpoint: Get farmer details by farmerId (userId)
app.get('/api/farmers/:farmerId', async (req, res) => {
  try {
    const farmerId = req.params.farmerId;
    
    // Try to find user and farmer profile
    const user = await User.findById(farmerId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    const farmerProfile = await FarmerProfile.findOne({ userId: farmerId });
    
    // Combine user and profile data
    const farmerData = {
      _id: user._id,
      name: user.name || 'Unknown Farmer',
      location: farmerProfile?.farmName || user.location || 'Location not specified',
      contact: user.contact || user.phone || 'Contact not available'
    };

    res.json({
      success: true,
      data: farmerData
    });
  } catch (error) {
    console.error('❌ Error fetching farmer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch farmer details'
    });
  }
});

// API Endpoint: Get farmers by crop name with their crop details
app.get('/api/farmers/by-crop/:cropName', async (req, res) => {
  try {
    const cropName = req.params.cropName;
    
    // Find all available crops with the given crop name
    const crops = await Crop.find({ 
      cropName: { $regex: new RegExp(`^${cropName}$`, 'i') },
      status: 'Available' 
    }).sort({ price: 1 });

    if (crops.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: 'No farmers found with this crop'
      });
    }

    // Get unique farmer IDs
    const farmerIds = [...new Set(crops.map(crop => crop.farmerId))];
    
    // Fetch farmer details for each farmer
    const farmersWithCrops = await Promise.all(
      farmerIds.map(async (farmerId) => {
        try {
          const user = await User.findById(farmerId);
          const farmerProfile = await FarmerProfile.findOne({ userId: farmerId });
          const farmerCrops = crops.filter(crop => crop.farmerId === farmerId);
          
          return {
            farmerId: farmerId,
            farmerName: user?.name || 'Unknown Farmer',
            location: farmerProfile?.farmName || user?.location || 'Location not specified',
            contact: user?.contact || user?.phone || 'Not available',
            crops: farmerCrops.map(crop => ({
              _id: crop._id,
              cropName: crop.cropName,
              quantity: crop.quantity,
              price: crop.price,
              imageUrl: crop.imageUrl,
              aiGrade: crop.aiGrade,
              harvestDate: crop.harvestDate
            })),
            totalQuantity: farmerCrops.reduce((sum, crop) => sum + crop.quantity, 0),
            averagePrice: farmerCrops.reduce((sum, crop) => sum + crop.price, 0) / farmerCrops.length
          };
        } catch (error) {
          console.error(`Error fetching farmer ${farmerId}:`, error);
          return null;
        }
      })
    );

    // Filter out any null results
    const validFarmers = farmersWithCrops.filter(farmer => farmer !== null);

    res.json({
      success: true,
      data: validFarmers,
      count: validFarmers.length
    });
  } catch (error) {
    console.error('❌ Error fetching farmers by crop:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch farmers for this crop'
    });
  }
});

// ==================== ESP32 STORAGE MONITORING ROUTES ====================

// API Endpoint: Receive sensor data from ESP32
app.post('/api/storage/readings', async (req, res) => {
  try {
    const { 
      farmerId, 
      temperature, 
      humidity, 
      CO2, 
      ammonia, 
      methane, 
      ethylene, 
      H2S,
      deviceId 
    } = req.body;

    console.log('📡 Received ESP32 data:', { temperature, humidity, CO2 });

    // Validate required fields
    if (!temperature || !humidity) {
      return res.status(400).json({
        success: false,
        message: 'Temperature and humidity are required'
      });
    }

    // Create storage reading
    const reading = new StorageReading({
      farmerId: farmerId || '507f1f77bcf86cd799439011',
      cropId: null, // Can be updated later when linked to specific crop
      batchId: `batch_${Date.now()}`,
      deviceId: deviceId || 'ESP32_001',
      temperature,
      humidity,
      gasLevel: {
        co2: CO2 || 0,
        ethylene: ethylene || 0,
        o2: 21.0 // Default atmospheric oxygen
      },
      location: 'Storage Unit',
      status: 'normal',
      timestamp: new Date()
    });

    // Determine status based on thresholds
    if (temperature > 30 || temperature < 0) reading.status = 'critical';
    else if (temperature > 25 || temperature < 5) reading.status = 'warning';
    
    if (humidity > 85 || humidity < 30) {
      reading.status = reading.status === 'critical' ? 'critical' : 'warning';
    }

    await reading.save();

    // Check if alert needs to be created
    if (reading.status === 'critical' || reading.status === 'warning') {
      const alert = new StorageAlert({
        farmerId: reading.farmerId,
        readingId: reading._id,
        alertType: reading.status === 'critical' ? 'Critical Condition' : 'Warning',
        severity: reading.status === 'critical' ? 'high' : 'medium',
        message: `Storage ${reading.status}: Temp ${temperature}°C, Humidity ${humidity}%`,
        acknowledged: false
      });
      await alert.save();
      console.log('⚠️ Alert created for storage conditions');
    }

    res.json({
      success: true,
      message: 'Sensor data received',
      data: {
        id: reading._id,
        status: reading.status,
        timestamp: reading.timestamp
      }
    });
  } catch (error) {
    console.error('❌ Error saving storage reading:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save sensor data'
    });
  }
});

// API Endpoint: Get latest storage readings for a farmer
app.get('/api/storage/readings/:farmerId', async (req, res) => {
  try {
    const readings = await StorageReading.find({ 
      farmerId: req.params.farmerId 
    })
    .sort({ timestamp: -1 })
    .limit(100);

    res.json({
      success: true,
      data: readings,
      count: readings.length
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch storage readings'
    });
  }
});

// API Endpoint: Get storage alerts
app.get('/api/storage/alerts/:farmerId', async (req, res) => {
  try {
    const alerts = await StorageAlert.find({ 
      farmerId: req.params.farmerId,
      acknowledged: false
    })
    .sort({ createdAt: -1 })
    .limit(50);

    res.json({
      success: true,
      data: alerts,
      count: alerts.length
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts'
    });
  }
});

// ==================== REQUEST MANAGEMENT ROUTES ====================

// API Endpoint: Create a new buyer request
app.post('/api/requests', async (req, res) => {
  try {
    const { farmerId, buyerId, buyerName, buyerContact, cropName, requestedQuantity, offerPrice, paymentMethod, transportNeeded, notes } = req.body;

    // Validation
    if (!farmerId || !buyerId || !buyerName || !cropName || !requestedQuantity || !offerPrice) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: farmerId, buyerId, buyerName, cropName, requestedQuantity, offerPrice'
      });
    }

    const newRequest = new Request({
      farmerId,
      buyerId,
      buyerName,
      buyerContact: buyerContact || '',
      cropName,
      requestedQuantity: parseFloat(requestedQuantity),
      offerPrice: parseFloat(offerPrice),
      totalAmount: parseFloat(requestedQuantity) * parseFloat(offerPrice),
      paymentMethod: paymentMethod || 'offline',
      transportNeeded: transportNeeded || false,
      notes: notes || '',
      status: 'pending'
    });

    await newRequest.save();

    console.log('✅ Request created:', newRequest._id);

    res.status(201).json({
      success: true,
      message: 'Request created successfully',
      data: newRequest
    });

  } catch (error) {
    console.error('❌ Error creating request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create request',
      error: error.message
    });
  }
});

// API Endpoint: Get all requests for a farmer
app.get('/api/requests/farmer/:farmerId', async (req, res) => {
  try {
    const requests = await Request.find({ 
      farmerId: req.params.farmerId 
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests,
      count: requests.length
    });

  } catch (error) {
    console.error('❌ Error fetching requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch requests',
      error: error.message
    });
  }
});

// API Endpoint: Get all requests sent by a buyer
app.get('/api/requests/buyer/:buyerId', async (req, res) => {
  try {
    const requests = await Request.find({ 
      buyerId: req.params.buyerId 
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests,
      count: requests.length
    });

  } catch (error) {
    console.error('❌ Error fetching buyer requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch buyer requests',
      error: error.message
    });
  }
});

// API Endpoint: Update request status (accept/deny/complete)
app.put('/api/requests/:requestId', async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!status || !['pending', 'accepted', 'denied', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: pending, accepted, denied, or completed'
      });
    }

    const updateData = { status };
    if (notes) updateData.notes = notes;

    const request = await Request.findByIdAndUpdate(
      req.params.requestId,
      updateData,
      { new: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    console.log('✅ Request updated:', request._id);

    res.json({
      success: true,
      message: 'Request updated successfully',
      data: request
    });

  } catch (error) {
    console.error('❌ Error updating request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update request',
      error: error.message
    });
  }
});

// API Endpoint: Delete a request
app.delete('/api/requests/:requestId', async (req, res) => {
  try {
    const request = await Request.findByIdAndDelete(req.params.requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    console.log('✅ Request deleted:', request._id);

    res.json({
      success: true,
      message: 'Request deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete request',
      error: error.message
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

// ==================== NEW BUYER DATABASE ROUTES ====================

// Authentication Routes
app.use('/api/auth', authRoutes);

// Buyer Routes (Purchase Orders)
app.use('/api/buyer/orders', buyerRoutes);

// Messages Routes
app.use('/api/messages', messagesRoutes);

// Wishlist Routes
app.use('/api/wishlist', wishlistRoutes);

// Transport Routes
app.use('/api/transport', transportRoutes);

// Transactions Routes
app.use('/api/transactions', transactionsRoutes);

// ==================== NEW LAYER-BASED ROUTES ====================

// Layer 3: AI Quality & Intelligence
app.use('/api/quality', qualityRoutes);

// Layer 6: IoT Storage Monitoring
app.use('/api/storage', storageRoutes);

// Layer 7: Notifications
app.use('/api/notifications', notificationsRoutes);

// Layer 8: Admin & Analytics
app.use('/api/admin', adminRoutes);

// ==================== EXISTING ENDPOINTS ====================

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'HarvestHub API is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🤖 Gemini Vision API: ${process.env.GEMINI_API_KEY ? 'Configured' : 'NOT configured'}`);
  console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? 'Configured' : 'Using default - CHANGE IN PRODUCTION'}`);
});
