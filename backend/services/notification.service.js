import Notification from '../models/Notification.js';

/**
 * Notification Service
 * Helper functions for creating system notifications
 */

class NotificationService {
  /**
   * Create a notification for a user
   * @param {Object} params - Notification parameters
   * @param {String} params.userId - User ID to receive notification
   * @param {String} params.type - Notification type
   * @param {String} params.title - Notification title
   * @param {String} params.message - Notification message
   * @param {String} params.relatedId - Related entity ID (optional)
   * @param {String} params.relatedModel - Related model name (optional)
   * @param {String} params.actionUrl - Action URL (optional)
   * @param {String} params.icon - Icon name (optional)
   * @param {String} params.priority - Priority level (optional)
   * @returns {Promise<Notification>}
   */
  async createNotification({
    userId,
    type,
    title,
    message,
    relatedId = null,
    relatedModel = null,
    actionUrl = null,
    icon = 'bell',
    priority = 'medium'
  }) {
    try {
      const notification = await Notification.create({
        userId,
        type,
        title,
        message,
        relatedId,
        relatedModel,
        actionUrl,
        icon,
        priority,
        readStatus: false
      });

      return notification;
    } catch (error) {
      console.error('❌ Notification Creation Error:', error);
      throw error;
    }
  }

  /**
   * Notify buyer about new request response
   */
  async notifyBuyerRequestResponse(buyerId, requestId, status, farmerName) {
    const statusMessages = {
      accepted: `${farmerName} has accepted your request`,
      denied: `${farmerName} has denied your request`,
      completed: `Your request with ${farmerName} has been completed`
    };

    return this.createNotification({
      userId: buyerId,
      type: 'request_update',
      title: 'Request Update',
      message: statusMessages[status] || 'Your request has been updated',
      relatedId: requestId,
      relatedModel: 'Request',
      actionUrl: `/requests/${requestId}`,
      icon: status === 'accepted' ? 'check-circle' : status === 'denied' ? 'x-circle' : 'info',
      priority: 'high'
    });
  }

  /**
   * Notify farmer about new request
   */
  async notifyFarmerNewRequest(farmerId, requestId, buyerName, cropName) {
    return this.createNotification({
      userId: farmerId,
      type: 'new_request',
      title: 'New Purchase Request',
      message: `${buyerName} has requested ${cropName}`,
      relatedId: requestId,
      relatedModel: 'Request',
      actionUrl: `/requests/${requestId}`,
      icon: 'inbox',
      priority: 'high'
    });
  }

  /**
   * Notify buyer about new message
   */
  async notifyNewMessage(userId, senderId, senderName) {
    return this.createNotification({
      userId,
      type: 'new_message',
      title: 'New Message',
      message: `${senderName} sent you a message`,
      relatedId: senderId,
      relatedModel: 'User',
      actionUrl: `/messages/${senderId}`,
      icon: 'message-circle',
      priority: 'medium'
    });
  }

  /**
   * Notify about payment
   */
  async notifyPayment(userId, amount, orderId, type = 'received') {
    const message = type === 'received' 
      ? `Payment of ₹${amount} received` 
      : `Payment of ₹${amount} processed`;

    return this.createNotification({
      userId,
      type: 'payment_update',
      title: 'Payment Update',
      message,
      relatedId: orderId,
      relatedModel: 'PurchaseOrder',
      actionUrl: `/orders/${orderId}`,
      icon: 'dollar-sign',
      priority: 'high'
    });
  }

  /**
   * Notify about order status change
   */
  async notifyOrderStatus(userId, orderId, status, orderNumber) {
    const statusMessages = {
      pending: 'Order is pending confirmation',
      accepted: 'Order has been accepted',
      in_progress: 'Order is in progress',
      delivered: 'Order has been delivered',
      completed: 'Order completed successfully',
      cancelled: 'Order has been cancelled'
    };

    return this.createNotification({
      userId,
      type: 'order_update',
      title: 'Order Update',
      message: statusMessages[status] || `Order ${orderNumber} updated`,
      relatedId: orderId,
      relatedModel: 'PurchaseOrder',
      actionUrl: `/orders/${orderId}`,
      icon: 'package',
      priority: 'high'
    });
  }

  /**
   * Notify about storage alert
   */
  async notifyStorageAlert(farmerId, alertType, message, readingId) {
    return this.createNotification({
      userId: farmerId,
      type: 'storage_alert',
      title: `Storage Alert: ${alertType}`,
      message,
      relatedId: readingId,
      relatedModel: 'StorageReading',
      actionUrl: '/storage',
      icon: 'alert-triangle',
      priority: 'critical'
    });
  }
}

export default new NotificationService();
