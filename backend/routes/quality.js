import express from 'express';
import CropQuality from '../models/CropQuality.js';
import PricePrediction from '../models/PricePrediction.js';
import Crop from '../models/Crop.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// GET crop quality for a specific crop
router.get('/quality/:cropId', async (req, res) => {
  try {
    const quality = await CropQuality.findOne({ cropId: req.params.cropId })
      .populate('cropId')
      .populate('farmerId');

    if (!quality) {
      return res.status(404).json({
        success: false,
        message: 'Quality analysis not found'
      });
    }

    res.status(200).json({
      success: true,
      data: quality
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching quality data',
      error: error.message
    });
  }
});

// GET all quality records for a farmer
router.get('/quality/farmer/:farmerId', authenticate, async (req, res) => {
  try {
    const qualities = await CropQuality.find({ farmerId: req.params.farmerId })
      .populate('cropId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: qualities.length,
      data: qualities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching quality records',
      error: error.message
    });
  }
});

// POST create crop quality record (from AI analysis)
router.post('/quality', authenticate, async (req, res) => {
  try {
    const {
      cropId,
      farmerId,
      batchId,
      grade,
      confidenceScore,
      qualityScore,
      defects,
      freshness,
      aiRemarks,
      imageRefs,
      modelUsed
    } = req.body;

    if (!cropId || !farmerId || !batchId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: cropId, farmerId, batchId'
      });
    }

    const newQuality = new CropQuality({
      cropId,
      farmerId,
      batchId,
      grade: grade || 'Pending',
      confidenceScore: confidenceScore || 0,
      qualityScore: qualityScore || 0,
      defects: defects || [],
      freshness: freshness || 'Unknown',
      aiRemarks: aiRemarks || '',
      imageRefs: imageRefs || [],
      modelUsed: modelUsed || 'pending',
      analyzedAt: new Date()
    });

    await newQuality.save();

    res.status(201).json({
      success: true,
      message: 'Quality record created',
      data: newQuality
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating quality record',
      error: error.message
    });
  }
});

// GET price prediction for crop type
router.get('/price/:cropType', async (req, res) => {
  try {
    const prediction = await PricePrediction.findOne({
      cropType: req.params.cropType
    });

    if (!prediction) {
      return res.status(404).json({
        success: false,
        message: 'Price prediction not found for this crop type'
      });
    }

    res.status(200).json({
      success: true,
      data: prediction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching price prediction',
      error: error.message
    });
  }
});

// GET all price predictions
router.get('/price/list/all', async (req, res) => {
  try {
    const predictions = await PricePrediction.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: predictions.length,
      data: predictions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching price predictions',
      error: error.message
    });
  }
});

// POST create/update price prediction
router.post('/price', authenticate, async (req, res) => {
  try {
    const {
      cropType,
      currentPrice,
      predictedPrice,
      trend,
      confidence,
      bestSellTime,
      priceChangePercent,
      modelUsed
    } = req.body;

    if (!cropType || currentPrice === undefined || predictedPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: cropType, currentPrice, predictedPrice'
      });
    }

    let prediction = await PricePrediction.findOne({ cropType });

    if (prediction) {
      // Update existing
      prediction.currentPrice = currentPrice;
      prediction.predictedPrice = predictedPrice;
      prediction.trend = trend || 'stable';
      prediction.confidence = confidence || 0;
      prediction.bestSellTime = bestSellTime || 'Now';
      prediction.priceChangePercent = priceChangePercent || 0;
      prediction.modelUsed = modelUsed || 'statistical';
      prediction.nextUpdate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    } else {
      // Create new
      prediction = new PricePrediction({
        cropType,
        currentPrice,
        predictedPrice,
        trend: trend || 'stable',
        confidence: confidence || 0,
        bestSellTime: bestSellTime || 'Now',
        priceChangePercent: priceChangePercent || 0,
        modelUsed: modelUsed || 'statistical'
      });
    }

    await prediction.save();

    res.status(prediction.isNew ? 201 : 200).json({
      success: true,
      message: `Price prediction ${prediction.isNew ? 'created' : 'updated'}`,
      data: prediction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error saving price prediction',
      error: error.message
    });
  }
});

// DELETE crop quality record
router.delete('/quality/:qualityId', authenticate, async (req, res) => {
  try {
    const quality = await CropQuality.findByIdAndDelete(req.params.qualityId);

    if (!quality) {
      return res.status(404).json({
        success: false,
        message: 'Quality record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Quality record deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting quality record',
      error: error.message
    });
  }
});

export default router;
