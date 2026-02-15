import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

const router = express.Router();

// Helper to create conversation ID with role-aware format
// Always format: "buyer:{buyerId}-farmer:{farmerId}"
const createConversationId = (userId1, user1Role, userId2, user2Role) => {
  if (user1Role === 'buyer' && user2Role === 'farmer') {
    return `buyer:${userId1.toString()}-farmer:${userId2.toString()}`;
  } else if (user1Role === 'farmer' && user2Role === 'buyer') {
    return `buyer:${userId2.toString()}-farmer:${userId1.toString()}`;
  }
  // Fallback for other cases (user to user)
  const ids = [userId1.toString(), userId2.toString()].sort();
  return `user:${ids[0]}-user:${ids[1]}`;
};

// SEND: Send a message to another user
router.post('/send', authenticate, async (req, res) => {
  try {
    const { receiverId, message, messageType = 'text', attachmentUrl, relatedOrderId } = req.body;

    if (!receiverId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide receiverId and message'
      });
    }

    // Verify receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Create conversation ID with role-aware format
    const conversationId = createConversationId(
      req.user._id,
      req.user.role,
      receiverId,
      receiver.role
    );

    const newMessage = await Message.create({
      senderId: req.user._id,
      receiverId,
      conversationId,
      message,
      messageType,
      attachmentUrl,
      relatedOrderId
    });

    await newMessage.populate('senderId', 'name email phone');
    await newMessage.populate('receiverId', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('❌ Send Message Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send message'
    });
  }
});

// READ: Get conversation between two users
router.get('/conversation/:userId', authenticate, async (req, res) => {
  try {
    const { skip = 0, limit = 50 } = req.query;
    const otherUserId = req.params.userId;

    // Get other user's information to create proper conversation ID
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const conversationId = createConversationId(
      req.user._id,
      req.user.role,
      otherUserId,
      otherUser.role
    );

    const messages = await Message.find({ conversationId })
      .populate('senderId', 'name email phone profileImage')
      .populate('receiverId', 'name email phone profileImage')
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Message.countDocuments({ conversationId });

    // Mark all messages in this conversation as read
    await Message.updateMany(
      {
        conversationId,
        receiverId: req.user._id,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.json({
      success: true,
      data: messages.reverse(),
      pagination: {
        total,
        skip: parseInt(skip),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('❌ Get Conversation Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch conversation'
    });
  }
});

// READ: Get all conversations for a user
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const { skip = 0, limit = 10 } = req.query;

    // Get unique conversation partners
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: req.user._id },
            { receiverId: req.user._id }
          ]
        }
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$message' },
          lastMessageTime: { $first: '$createdAt' },
          otherUserId: {
            $first: {
              $cond: [
                { $eq: ['$senderId', req.user._id] },
                '$receiverId',
                '$senderId'
              ]
            }
          },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiverId', req.user._id] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { lastMessageTime: -1 } },
      { $skip: parseInt(skip) },
      { $limit: parseInt(limit) }
    ]);

    // Populate user details
    for (let conv of conversations) {
      const user = await User.findById(conv.otherUserId).select('name email phone profileImage');
      conv.otherUser = user;
    }

    const total = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: req.user._id },
            { receiverId: req.user._id }
          ]
        }
      },
      {
        $group: {
          _id: '$conversationId'
        }
      },
      {
        $count: 'total'
      }
    ]);

    res.json({
      success: true,
      data: conversations,
      pagination: {
        total: total[0]?.total || 0,
        skip: parseInt(skip),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('❌ Get Conversations Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch conversations'
    });
  }
});

// READ: Get unread message count
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const unreadCount = await Message.countDocuments({
      receiverId: req.user._id,
      isRead: false
    });

    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error('❌ Get Unread Count Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch unread count'
    });
  }
});

// READ: Get new messages since timestamp (for polling)
router.get('/poll/:conversationId', authenticate, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { sinceTimestamp } = req.query;

    // Validate conversationId matches user
    const conversationParts = conversationId.split('-');
    const userIdStr = req.user._id.toString();
    
    // Check if user is part of this conversation
    const isPartOfConversation = conversationParts.some(id => id === userIdStr);
    if (!isPartOfConversation) {
      return res.status(403).json({
        success: false,
        message: 'You are not part of this conversation'
      });
    }

    let query = { conversationId };
    
    // If sinceTimestamp provided, only get newer messages
    if (sinceTimestamp) {
      query.createdAt = { $gt: new Date(sinceTimestamp) };
    }

    const newMessages = await Message.find(query)
      .populate('senderId', 'name email phone profileImage')
      .populate('receiverId', 'name email phone profileImage')
      .sort({ createdAt: 1 });

    // Mark received messages as read
    if (newMessages.length > 0) {
      await Message.updateMany(
        {
          conversationId,
          receiverId: req.user._id,
          isRead: false
        },
        {
          isRead: true,
          readAt: new Date()
        }
      );
    }

    res.json({
      success: true,
      data: newMessages,
      message: `Found ${newMessages.length} new messages`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Poll Messages Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to poll messages'
    });
  }
});

// DELETE: Delete a message
router.delete('/:messageId', authenticate, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    if (message.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages'
      });
    }

    await Message.findByIdAndDelete(req.params.messageId);

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete Message Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete message'
    });
  }
});

// READ: Get all conversations for a user by ID (for URL-based access)
router.get('/user/:userId/conversations', async (req, res) => {
  try {
    const { userId } = req.params;
    const { skip = 0, limit = 50 } = req.query;

    if (!userId || userId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Valid user ID is required'
      });
    }

    const mongoose = await import('mongoose');
    const userObjectId = new mongoose.default.Types.ObjectId(userId);

    // Get unique conversation partners
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: userObjectId },
            { receiverId: userObjectId }
          ]
        }
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$message' },
          lastMessageTime: { $first: '$createdAt' },
          otherUserId: {
            $first: {
              $cond: [
                { $eq: ['$senderId', userObjectId] },
                '$receiverId',
                '$senderId'
              ]
            }
          },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiverId', userObjectId] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { lastMessageTime: -1 } },
      { $skip: parseInt(skip) },
      { $limit: parseInt(limit) }
    ]);

    // Populate user details
    for (let conv of conversations) {
      const user = await User.findById(conv.otherUserId).select('name email phone role');
      conv.otherUser = user;
    }

    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('Error fetching user conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations'
    });
  }
});

// READ: Get messages between two users by ID (for URL-based access)
router.get('/user/:userId/conversation/:otherUserId', async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;
    const { skip = 0, limit = 100 } = req.query;

    if (!userId || userId === 'undefined' || !otherUserId || otherUserId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Valid user IDs are required'
      });
    }

    // Get both users to determine roles
    const user1 = await User.findById(userId);
    const user2 = await User.findById(otherUserId);

    if (!user1 || !user2) {
      return res.status(404).json({
        success: false,
        message: 'One or both users not found'
      });
    }

    // Create conversation ID with role-aware format
    const conversationId = createConversationId(userId, user1.role, otherUserId, user2.role);

    const messages = await Message.find({ conversationId })
      .populate('senderId', 'name email phone role')
      .populate('receiverId', 'name email phone role')
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    // Mark messages as read for the requesting user
    const mongoose = await import('mongoose');
    const userObjectId = new mongoose.default.Types.ObjectId(userId);
    await Message.updateMany(
      {
        conversationId,
        receiverId: userObjectId,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.json({
      success: true,
      data: messages.reverse()
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversation'
    });
  }
});

// SEND: Send a message using URL-based sender ID (no auth required)
router.post('/user/:senderId/send', async (req, res) => {
  try {
    const { senderId } = req.params;
    const { receiverId, message, messageType = 'text' } = req.body;

    if (!senderId || senderId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Valid sender ID is required'
      });
    }

    if (!receiverId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide receiverId and message'
      });
    }

    // Verify both users exist
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender) {
      return res.status(404).json({
        success: false,
        message: 'Sender not found'
      });
    }

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Create conversation ID with role-aware format
    const conversationId = createConversationId(senderId, sender.role, receiverId, receiver.role);

    const newMessage = await Message.create({
      senderId,
      receiverId,
      conversationId,
      message,
      messageType
    });

    await newMessage.populate('senderId', 'name email phone role');
    await newMessage.populate('receiverId', 'name email phone role');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('❌ Send Message (URL-based) Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send message'
    });
  }
});

export default router;
