import express from 'express';
import StorageReading from '../models/StorageReading.js';
import StorageAlert from '../models/StorageAlert.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// GET storage readings for a batch
router.get('/readings/:batchId', async (req, res) => {
  try {
    const readings = await StorageReading.find({ batchId: req.params.batchId })
      .sort({ timestamp: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: readings.length,
      data: readings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching storage readings',
      error: error.message
    });
  }
});

// GET latest reading for a batch
router.get('/readings/latest/:batchId', async (req, res) => {
  try {
    const reading = await StorageReading.findOne({ batchId: req.params.batchId })
      .sort({ timestamp: -1 });

    if (!reading) {
      return res.status(404).json({
        success: false,
        message: 'No readings found for this batch'
      });
    }

    res.status(200).json({
      success: true,
      data: reading
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching latest reading',
      error: error.message
    });
  }
});

// POST new storage reading (from IoT device)
router.post('/readings', authenticate, async (req, res) => {
  try {
    const { batchId, cropId, farmerId, temperature, humidity, gasLevel, deviceId, location, status } = req.body;

    if (!batchId || !deviceId || temperature === undefined || humidity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: batchId, deviceId, temperature, humidity'
      });
    }

    const newReading = new StorageReading({
      batchId,
      cropId,
      farmerId,
      temperature,
      humidity,
      gasLevel: gasLevel || {},
      deviceId,
      location: location || 'Cold Storage',
      status: status || 'normal'
    });

    await newReading.save();

    res.status(201).json({
      success: true,
      message: 'Storage reading recorded',
      data: newReading
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error saving storage reading',
      error: error.message
    });
  }
});

// GET storage alerts for a batch
router.get('/alerts/:batchId', async (req, res) => {
  try {
    const alerts = await StorageAlert.find({ batchId: req.params.batchId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching alerts',
      error: error.message
    });
  }
});

// GET unresolved/active alerts for farmer
router.get('/alerts/farmer/:farmerId', authenticate, async (req, res) => {
  try {
    const alerts = await StorageAlert.find({
      farmerId: req.params.farmerId,
      resolved: false
    })
      .sort({ severity: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching farmer alerts',
      error: error.message
    });
  }
});

// POST create storage alert
router.post('/alerts', authenticate, async (req, res) => {
  try {
    const {
      batchId,
      cropId,
      farmerId,
      alertType,
      severity,
      message,
      threshold,
      currentReadings,
      recommendedAction
    } = req.body;

    if (!batchId || !alertType || !severity || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: batchId, alertType, severity, message'
      });
    }

    const newAlert = new StorageAlert({
      batchId,
      cropId,
      farmerId,
      alertType,
      severity,
      message,
      threshold: threshold || {},
      currentReadings: currentReadings || {},
      recommendedAction: recommendedAction || '',
      resolved: false
    });

    await newAlert.save();

    res.status(201).json({
      success: true,
      message: 'Storage alert created',
      data: newAlert
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating alert',
      error: error.message
    });
  }
});

// PATCH resolve storage alert
router.patch('/alerts/:alertId/resolve', authenticate, async (req, res) => {
  try {
    const { action } = req.body;

    const alert = await StorageAlert.findByIdAndUpdate(
      req.params.alertId,
      {
        resolved: true,
        action: action || 'Manual resolution',
        resolvedAt: new Date()
      },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Alert resolved',
      data: alert
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resolving alert',
      error: error.message
    });
  }
});

// GET storage health summary for batch
router.get('/health/:batchId', async (req, res) => {
  try {
    const latestReading = await StorageReading.findOne({ batchId: req.params.batchId })
      .sort({ timestamp: -1 });

    const activeAlerts = await StorageAlert.countDocuments({
      batchId: req.params.batchId,
      resolved: false
    });

    if (!latestReading) {
      return res.status(404).json({
        success: false,
        message: 'No readings found for this batch'
      });
    }

    const health = {
      temperature: latestReading.temperature,
      humidity: latestReading.humidity,
      gasLevels: latestReading.gasLevel,
      status: latestReading.status,
      activeAlerts,
      lastUpdate: latestReading.timestamp
    };

    res.status(200).json({
      success: true,
      data: health
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching storage health',
      error: error.message
    });
  }
});

export default router;
