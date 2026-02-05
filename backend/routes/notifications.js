import express from 'express';
import Notification from '../models/Notification.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// GET all notifications for user
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 20;
    const skip = parseInt(req.query.skip) || 0;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('userId', 'name email');

    const total = await Notification.countDocuments({ userId });
    const unread = await Notification.countDocuments({ userId, readStatus: false });

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        total,
        unread,
        limit,
        skip
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
});

// GET unread notifications count
router.get('/unread/count', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const unreadCount = await Notification.countDocuments({
      userId,
      readStatus: false,
      archived: false
    });

    res.status(200).json({
      success: true,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count',
      error: error.message
    });
  }
});

// POST create notification
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      userId,
      type,
      title,
      message,
      relatedId,
      relatedModel,
      actionUrl,
      icon,
      priority
    } = req.body;

    if (!userId || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, type, title, message'
      });
    }

    const newNotification = new Notification({
      userId,
      type,
      title,
      message,
      relatedId: relatedId || null,
      relatedModel: relatedModel || null,
      actionUrl: actionUrl || null,
      icon: icon || 'bell',
      priority: priority || 'medium',
      readStatus: false
    });

    await newNotification.save();

    res.status(201).json({
      success: true,
      message: 'Notification created',
      data: newNotification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating notification',
      error: error.message
    });
  }
});

// PATCH mark notification as read
router.patch('/:notificationId/read', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.notificationId,
      {
        readStatus: true,
        readAt: new Date()
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message
    });
  }
});

// PATCH mark all notifications as read
router.patch('/read/all', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Notification.updateMany(
      { userId, readStatus: false },
      { readStatus: true, readAt: new Date() }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      modified: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking all as read',
      error: error.message
    });
  }
});

// PATCH archive notification
router.patch('/:notificationId/archive', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.notificationId,
      {
        archived: true,
        archivedAt: new Date()
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification archived',
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error archiving notification',
      error: error.message
    });
  }
});

// DELETE notification
router.delete('/:notificationId', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message
    });
  }
});

// DELETE all archived notifications
router.delete('/delete/archived', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Notification.deleteMany({
      userId,
      archived: true
    });

    res.status(200).json({
      success: true,
      message: 'Archived notifications deleted',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting archived notifications',
      error: error.message
    });
  }
});

export default router;
