# Real-Time Messaging System - Implementation Guide

## Overview
This document describes the REST API-based polling system for real-time messaging between farmers and buyers.

## Architecture

### Components
1. **Frontend**: React component with polling mechanism (3-second intervals)
2. **Backend**: Express API endpoints with MongoDB Message model
3. **Polling Service**: `polling.service.js` for message retrieval logic
4. **Routes**: Enhanced messages.js with polling endpoint

### Technology Stack
- **Frontend**: React, TypeScript, Lucide Icons
- **Backend**: Node.js/Express, MongoDB with Mongoose
- **Communication**: REST API with polling (not WebSocket)
- **Polling Interval**: 3 seconds (configurable)

## API Endpoints

### 1. Send Message
**Endpoint**: `POST /api/messages/send`

**Headers**:
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>"
}
```

**Request Body**:
```json
{
  "receiverId": "farmer1_id",
  "message": "Can you provide more details?",
  "messageType": "text",
  "relatedOrderId": "order_123" (optional)
}
```

**Response (201)**:
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "_id": "msg_123",
    "senderId": { "name": "Buyer Name", "email": "buyer@email.com" },
    "receiverId": { "name": "Farmer Name", "email": "farmer@email.com" },
    "conversationId": "buyer1-farmer1",
    "message": "Can you provide more details?",
    "messageType": "text",
    "isRead": false,
    "createdAt": "2026-02-05T10:30:00Z"
  }
}
```

---

### 2. Get Conversation Messages
**Endpoint**: `GET /api/messages/conversation/:userId`

**Query Parameters**:
- `skip`: Number of messages to skip (default: 0)
- `limit`: Number of messages to return (default: 50)

**Headers**:
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "msg_123",
      "senderId": { "name": "Buyer", "email": "buyer@email.com" },
      "receiverId": { "name": "Farmer", "email": "farmer@email.com" },
      "conversationId": "buyer1-farmer1",
      "message": "Hi, interested in your wheat",
      "messageType": "text",
      "isRead": true,
      "createdAt": "2026-02-05T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 50,
    "skip": 0,
    "limit": 50
  }
}
```

**Automatically marks all conversation messages as read**.

---

### 3. Get All Conversations (Polling)
**Endpoint**: `GET /api/messages/poll/:conversationId`

**Query Parameters**:
- `sinceTimestamp`: ISO timestamp to get only new messages (optional)
  - Example: `?sinceTimestamp=2026-02-05T10:30:00Z`

**Headers**:
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "msg_456",
      "senderId": { "name": "Farmer", "email": "farmer@email.com" },
      "receiverId": { "name": "Buyer", "email": "buyer@email.com" },
      "conversationId": "buyer1-farmer1",
      "message": "Grade A wheat, certified",
      "messageType": "text",
      "isRead": true,
      "createdAt": "2026-02-05T10:35:00Z"
    }
  ],
  "message": "Found 1 new messages",
  "timestamp": "2026-02-05T10:40:00Z"
}
```

**Use Case**: Client polls this endpoint every 3 seconds to get new messages since the last poll timestamp.

---

### 4. Get All Conversations
**Endpoint**: `GET /api/messages/conversations`

**Query Parameters**:
- `skip`: Number of conversations to skip (default: 0)
- `limit`: Conversations per page (default: 10)

**Headers**:
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "buyer1-farmer1",
      "lastMessage": "Grade A wheat, certified",
      "lastMessageTime": "2026-02-05T10:35:00Z",
      "otherUserId": "farmer1",
      "otherUser": {
        "name": "Raj Kumar",
        "email": "raj@email.com",
        "phone": "+91-9999999999"
      },
      "unreadCount": 2
    }
  ],
  "pagination": {
    "total": 3,
    "skip": 0,
    "limit": 10
  }
}
```

---

### 5. Get Unread Count
**Endpoint**: `GET /api/messages/unread-count`

**Headers**:
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response (200)**:
```json
{
  "success": true,
  "unreadCount": 5
}
```

---

### 6. Delete Message
**Endpoint**: `DELETE /api/messages/:messageId`

**Headers**:
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Message deleted successfully"
}
```

---

## Frontend Implementation

### Polling Mechanism

The frontend Messages component implements polling with the following features:

#### 1. Initialize Polling
```javascript
useEffect(() => {
  if (!selectedConversation || !pollingActive) return;

  // Fetch messages immediately
  fetchMessages();

  // Set up polling interval (3 seconds)
  pollingIntervalRef.current = setInterval(() => {
    fetchMessages();
  }, 3000);

  return () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
  };
}, [selectedConversation, pollingActive, fetchMessages]);
```

#### 2. Fetch Messages
```javascript
const fetchMessages = async () => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/messages/conversation/${selectedConversation}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    const data = await response.json();
    setMessages(data.data);
  } catch (error) {
    console.error('Error fetching messages:', error);
  }
};
```

#### 3. Send Message
```javascript
const handleSendMessage = async (e) => {
  e.preventDefault();
  
  const response = await fetch(
    'http://localhost:5000/api/messages/send',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        receiverId: otherUserId,
        message: newMessage,
        messageType: 'text'
      })
    }
  );

  const result = await response.json();
  if (result.success) {
    setNewMessage('');
    // Message will appear in next polling cycle
  }
};
```

---

## Polling vs WebSocket

### Why REST Polling?

**Advantages**:
- ✅ No additional libraries needed
- ✅ Works behind all firewalls and proxies
- ✅ Simpler error handling
- ✅ Easy to implement and debug
- ✅ Suitable for MVP/demo applications
- ✅ Can be easily upgraded to WebSocket later

**Trade-offs**:
- Slightly higher latency (3-second delay)
- More HTTP requests (mitigated by efficient queries)
- Server load increases with user count

### Optimization Strategies

1. **Adaptive Polling**: Increase interval when no activity
   ```javascript
   // Poll every 2 seconds if unread messages exist
   // Poll every 5 seconds if no activity
   const interval = unreadCount > 0 ? 2000 : 5000;
   ```

2. **Timestamp-Based Polling**: Only fetch new messages
   ```javascript
   const polledMessagesSince2026-02-05T10:35:00Z
   ```

3. **Conversation Switching**: Reduce polling across conversations
   ```javascript
   // Only poll the active conversation
   if (selectedConversation !== conversationId) return;
   ```

---

## Database Schema

### Message Model

```javascript
{
  _id: ObjectId,
  
  // Users
  senderId: ObjectId,           // Reference to User
  receiverId: ObjectId,         // Reference to User
  
  // Conversation Management
  conversationId: String,       // "userId1-userId2" (sorted)
  relatedOrderId: ObjectId,     // Optional order reference
  
  // Message Content
  message: String,              // Message text
  messageType: String,          // "text", "image", "file"
  attachmentUrl: String,        // Optional attachment URL
  
  // Status
  isRead: Boolean,              // Whether message is read
  readAt: Date,                 // When message was read
  
  // Timestamps
  createdAt: Date,              // Message creation time
  updatedAt: Date               // Last update time
}
```

---

## Real-World Integration Steps

### Step 1: Update Frontend Messages Component
Replace mock data with actual API calls:
```javascript
// In fetchMessages callback
const response = await fetch(
  `http://localhost:5000/api/messages/conversation/${selectedConversation}`,
  { headers: { Authorization: `Bearer ${token}` } }
);
```

### Step 2: Configure Backend
Ensure server.js imports messages route:
```javascript
import messagesRouter from './routes/messages.js';
app.use('/api/messages', messagesRouter);
```

### Step 3: Database Connection
Verify MongoDB connection and Message model is registered:
```javascript
// In server.js
mongoose.connect(process.env.MONGODB_URI);
```

### Step 4: Auth Configuration
Ensure JWT authentication middleware is applied:
```javascript
router.use(authenticate); // Middleware on all routes
```

### Step 5: Testing
Test the flow:
1. Send message via POST /api/messages/send
2. Poll for new messages via GET /api/messages/poll/:conversationId
3. Verify read status updates
4. Check unread count via GET /api/messages/unread-count

---

## Error Handling

### Common Errors

| Status | Error | Solution |
|--------|-------|----------|
| 400 | Missing receiverId/message | Provide both fields |
| 401 | Unauthorized | Include valid JWT token |
| 403 | Not part of conversation | Ensure conversationId includes your userId |
| 404 | Receiver not found | Verify receiverId exists |
| 500 | Server error | Check MongoDB connection |

### Retry Logic
```javascript
async function fetchWithRetry(url, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}
```

---

## Performance Considerations

### Polling Efficiency
- **Message Count**: Query is fast with indexed conversationId
- **HTTP Overhead**: ~0.5KB per request
- **Network**: Negligible at 3-second intervals
- **CPU**: Minimal, queries are indexed

### Scaling Recommendations
- For 10,000+ users: Add Redis caching
- For 100,000+ users: Migrate to WebSocket (Socket.IO)
- Database indexing on conversationId, createdAt
- Create compound index: {conversationId, createdAt} for efficient sorting

### Index Configuration
```javascript
// In Message model
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, isRead: 1 });
```

---

## Configuration

### Polling Interval
Currently set to 3 seconds in Messages.tsx:
```javascript
pollingIntervalRef.current = setInterval(() => {
  fetchMessages();
}, 3000); // Change to desired interval
```

### API Base URL
Update in Messages.tsx or create config file:
```javascript
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

### JWT Token
Ensure token is passed in Authorization header:
```javascript
const token = localStorage.getItem('authToken');
headers: { Authorization: `Bearer ${token}` }
```

---

## Testing

### Manual Test Scenario

1. **Start Backend**
   ```bash
   npm start
   ```

2. **Generate Test Users**
   - Create buyer1 and farmer1
   - Get auth tokens for both

3. **Send Message**
   ```bash
   curl -X POST http://localhost:5000/api/messages/send \
     -H "Authorization: Bearer <buyer_token>" \
     -H "Content-Type: application/json" \
     -d '{"receiverId":"farmer1","message":"Hi there!"}'
   ```

4. **Poll for Messages** (every 3 seconds)
   ```bash
   curl http://localhost:5000/api/messages/poll/buyer1-farmer1 \
     -H "Authorization: Bearer <farmer_token>" \
     -H "sinceTimestamp=2026-02-05T10:35:00Z"
   ```

5. **Verify Read Status**
   ```bash
   curl http://localhost:5000/api/messages/conversation/buyer1 \
     -H "Authorization: Bearer <farmer_token>"
   ```

---

## Next Steps

1. **Remove Mock Data**: Update Messages.tsx to use real API
2. **Add Real Auth**: Integrate with actual JWT tokens
3. **Error Handling**: Add retry logic and error UI
4. **Typing Indicators**: Show "Farmer is typing..."
5. **Message Search**: Add ability to search conversations
6. **File Uploads**: Implement image/file attachment feature
7. **Voice Messages**: Add audio message support
8. **Group Chats**: Extend to multiple users

---

## Troubleshooting

### Messages not appearing?
- Check polling is active (status indicator shows "Active")
- Verify receiverId is correct
- Check browser console for errors

### High latency?
- Check network tab in browser DevTools
- Reduce polling interval if acceptable
- Verify API is responding quickly

### Can't send message?
- Ensure you're authenticated (token in localStorage)
- Check receiverId exists in database
- Verify message is not empty

### Polling stops after disconnect?
- Add reconnection logic
- Implement exponential backoff
- Restart polling on window focus

---

## Backend Configuration

### Required Environment Variables
```bash
MONGODB_URI=mongodb://localhost:27017/farm-db
JWT_SECRET=your_secret_key
PORT=5000
```

### Server Setup
```javascript
// server.js
import messagesRouter from './routes/messages.js';

app.use(express.json());
app.use('/api/messages', authenticate, messagesRouter); // Protect all routes
```

---

## Summary

**Current Status**: ✅ Implementation Ready

- ✅ Backend API endpoints created (polling endpoint added)
- ✅ Frontend component with polling mechanism
- ✅ MongoDB model and schema ready
- ✅ Authentication middleware integrated
- ✅ Error handling and response structure

**Production Checklist**:
- [ ] Replace mock data with real API calls
- [ ] Add proper error handling/retry logic
- [ ] Implement typing indicators
- [ ] Add conversation search
- [ ] Setup database indexes
- [ ] Load testing at scale
- [ ] Consider WebSocket migration for >10k users

---

**Last Updated**: February 5, 2026
**Version**: 1.0 - REST API Polling Edition
