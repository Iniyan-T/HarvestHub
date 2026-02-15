# User ID Linking System - HarvestHub

**Date:** February 6, 2026  
**Status:** ✅ Implemented & Active

## Overview

This document explains how HarvestHub ensures data integrity and proper user linking across all farmer-buyer interactions using MongoDB ObjectId references.

## Core Principle

**All farmer-buyer interactions are linked via unique user IDs (MongoDB ObjectId) stored in the User collection.**

Every user (farmer or buyer) has a unique `_id` that serves as the single source of truth for:
- Crop ownership
- Purchase requests
- Messages
- Transactions
- Transport scheduling
- Order management

## User Model Structure

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),  // Unique user identifier
  name: "John Farmer",
  email: "john@example.com",
  phone: "+1234567890",
  role: "farmer",  // or "buyer" or "admin"
  address: {
    street: "123 Farm Road",
    city: "Springfield",
    state: "IL",
    zipCode: "62701",
    latitude: 39.7817,
    longitude: -89.6501
  },
  profileImage: "/uploads/profile-123.jpg",
  isActive: true,
  createdAt: "2026-01-15T10:00:00Z"
}
```

## Data Models with User ID References

### 1. Crop Model
**Purpose:** Store crop information owned by farmers

```javascript
{
  _id: ObjectId("..."),
  farmerId: ObjectId("507f1f77bcf86cd799439011"),  // References User._id
  cropName: "Wheat",
  quantity: 1000,
  price: 25.50,
  imageUrl: "/uploads/crop-123.jpg",
  aiGrade: {
    grade: "A",
    confidence: 95.2
  },
  status: "Available"
}
```

**Key Points:**
- `farmerId` is an ObjectId reference to User collection
- Can be populated to get farmer details: `.populate('farmerId', 'name email phone address')`
- Ensures only valid farmers can own crops

### 2. Request Model
**Purpose:** Store purchase requests from buyers to farmers

```javascript
{
  _id: ObjectId("..."),
  farmerId: ObjectId("507f1f77bcf86cd799439011"),  // Farmer receiving request
  buyerId: ObjectId("507f191e810c19729de860ea"),   // Buyer sending request
  buyerName: "Jane Buyer",
  buyerContact: "+9876543210",
  cropName: "Wheat",
  requestedQuantity: 100,
  offerPrice: 25.00,
  totalAmount: 2500.00,
  status: "pending",
  createdAt: "2026-02-06T14:30:00Z"
}
```

**Key Points:**
- Both `farmerId` and `buyerId` are ObjectId references
- Can populate both to get complete user information
- Ensures request is always between valid users
- Authorization checks verify user IDs match authenticated user

### 3. Message Model
**Purpose:** Enable communication between buyers and farmers

```javascript
{
  _id: ObjectId("..."),
  senderId: ObjectId("507f191e810c19729de860ea"),    // User who sent message
  receiverId: ObjectId("507f1f77bcf86cd799439011"),  // User who receives message
  conversationId: "buyer:507f191e810c19729de860ea-farmer:507f1f77bcf86cd799439011",
  message: "Is this wheat still available?",
  messageType: "text",
  isRead: false,
  createdAt: "2026-02-06T15:00:00Z"
}
```

**Key Points:**
- Role-aware conversation IDs ensure consistent message threading
- Format: `"buyer:{buyerId}-farmer:{farmerId}"` always in same order
- Both sender and receiver must be valid users
- Prevents message spoofing or unauthorized access

### 4. Transaction Model
**Purpose:** Record financial transactions between buyers and farmers

```javascript
{
  _id: ObjectId("..."),
  orderId: ObjectId("..."),
  buyerId: ObjectId("507f191e810c19729de860ea"),
  farmerId: ObjectId("507f1f77bcf86cd799439011"),
  amount: 2500.00,
  paymentMethod: "bank_transfer",
  status: "completed",
  paymentDate: "2026-02-06T16:00:00Z"
}
```

**Key Points:**
- Links payment to specific order and both parties
- Enables accurate financial tracking per user
- Updates buyer/farmer profile statistics automatically

### 5. PurchaseOrder Model
**Purpose:** Manage orders between buyers and farmers

```javascript
{
  _id: ObjectId("..."),
  buyerId: ObjectId("507f191e810c19729de860ea"),
  farmerId: ObjectId("507f1f77bcf86cd799439011"),
  cropId: ObjectId("..."),
  quantity: 100,
  pricePerUnit: 25.00,
  totalAmount: 2500.00,
  status: "pending",
  orderNumber: "ORD-2026-001"
}
```

**Key Points:**
- Three-way relationship: buyer, farmer, and crop
- All references are ObjectId for data integrity
- Status updates authorized by user role

### 6. Transport Model
**Purpose:** Manage logistics between farmer and buyer locations

```javascript
{
  _id: ObjectId("..."),
  orderId: ObjectId("..."),
  farmerId: ObjectId("507f1f77bcf86cd799439011"),
  buyerId: ObjectId("507f191e810c19729de860ea"),
  pickupLocation: { /* farmer address */ },
  deliveryLocation: { /* buyer address */ },
  status: "scheduled",
  estimatedDelivery: "2026-02-08T10:00:00Z"
}
```

**Key Points:**
- Links transport to order and both parties
- Uses user addresses from User model
- Calculates distances using user coordinates

## API Endpoints with User ID Linking

### Authentication & Authorization

All protected endpoints use JWT middleware:

```javascript
router.get('/api/crops/farmer/my-crops', 
  authenticate,           // Adds req.user with decoded JWT
  authorize('farmer'),    // Verifies user.role === 'farmer'
  async (req, res) => {
    // req.user._id contains authenticated user's ObjectId
  }
);
```

### Crop Endpoints

**GET /api/crops**
- Returns all crops with populated farmer information
- Population: `.populate('farmerId', 'name email phone address profileImage')`

```javascript
// Response
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "farmerId": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Farmer",
        "email": "john@example.com",
        "phone": "+1234567890"
      },
      "cropName": "Wheat",
      "quantity": 1000
    }
  ]
}
```

**GET /api/crops/farmer/my-crops**
- Returns only crops owned by authenticated farmer
- Filter: `{ farmerId: req.user._id }`
- Ensures farmers see only their own crops

**POST /api/crops/analyze**
- Creates new crop with authenticated farmer's ID
- Auto-assigns: `farmerId: req.user._id`
- Prevents impersonation

### Request Endpoints

**POST /api/requests**
- Buyer creates request to farmer
- Validates farmer exists: `await User.findById(farmerId)`
- Auto-assigns buyer: `buyerId: req.user._id`

```javascript
// Validation ensures farmer exists
const farmer = await User.findById(farmerId);
if (!farmer || farmer.role !== 'farmer') {
  return res.status(404).json({ 
    message: 'Farmer not found' 
  });
}
```

**GET /api/requests/farmer/my-requests**
- Returns requests for authenticated farmer
- Filter: `{ farmerId: req.user._id }`
- Populates both buyer and farmer information

**GET /api/requests/buyer/my-requests**
- Returns requests from authenticated buyer
- Filter: `{ buyerId: req.user._id }`
- Populates both buyer and farmer information

**PUT /api/requests/:requestId**
- Updates request status
- Authorization check ensures user is involved:

```javascript
if (request.farmerId.toString() !== req.user._id.toString() && 
    request.buyerId.toString() !== req.user._id.toString()) {
  return res.status(403).json({ 
    message: 'Not authorized' 
  });
}
```

### Message Endpoints

**POST /api/messages/send**
- Validates receiver exists: `await User.findById(receiverId)`
- Creates role-aware conversation ID
- Auto-assigns sender: `senderId: req.user._id`

**GET /api/messages/conversation/:userId**
- Gets messages between authenticated user and specified user
- Creates conversation ID dynamically
- Ensures users can only see their own conversations

### Transaction Endpoints

**POST /api/transactions/record-payment**
- Records payment from buyer to farmer
- Validates order belongs to buyer:

```javascript
if (order.buyerId.toString() !== req.user._id.toString()) {
  return res.status(403).json({ 
    message: 'Not authorized' 
  });
}
```

- Updates both buyer and farmer profiles automatically

**GET /api/transactions/my-transactions**
- Returns transactions for authenticated user
- Filter: `{ $or: [{ buyerId: req.user._id }, { farmerId: req.user._id }] }`

### Order Endpoints

**POST /api/buyer/orders/create**
- Validates farmer and crop exist
- Auto-assigns buyer: `buyerId: req.user._id`
- Links to verified entities only

**GET /api/buyer/orders/my-orders**
- Returns orders for authenticated buyer
- Filter: `{ buyerId: req.user._id }`

**PUT /api/buyer/orders/:orderId/accept**
- Farmer accepts order
- Authorization: `order.farmerId.toString() === req.user._id.toString()`

## Data Integrity Benefits

### 1. Referential Integrity
- MongoDB enforces ObjectId relationships
- Invalid user IDs automatically rejected
- Prevents orphaned records

### 2. Authorization Security
- User can only access their own data
- Role-based access control (farmer/buyer/admin)
- Prevents data leakage between users

### 3. Data Consistency
- Single source of truth for user information
- Updates to User model reflect everywhere
- No duplicate user data

### 4. Query Performance
- Indexed ObjectId fields enable fast lookups
- Efficient population of related data
- Optimized filtering by user ID

### 5. Audit Trail
- Every action linked to specific user
- Transaction history traceable
- Order lifecycle fully documented

## Implementation Best Practices

### 1. Always Validate Users Exist

```javascript
// ✅ Good - Validate before creating relationship
const farmer = await User.findById(farmerId);
if (!farmer || farmer.role !== 'farmer') {
  return res.status(404).json({ message: 'Farmer not found' });
}

// ❌ Bad - Create relationship without validation
const request = await Request.create({ 
  farmerId  // Might not exist!
});
```

### 2. Use .toString() for ObjectId Comparisons

```javascript
// ✅ Good - Convert ObjectId to string
if (order.buyerId.toString() === req.user._id.toString()) {
  // Authorized
}

// ❌ Bad - Direct ObjectId comparison
if (order.buyerId === req.user._id) {
  // May not work correctly
}
```

### 3. Populate Related Data

```javascript
// ✅ Good - Populate user details
const crops = await Crop.find()
  .populate('farmerId', 'name email phone address');

// ❌ Bad - Return ObjectId only
const crops = await Crop.find();
// Returns: farmerId: ObjectId("...")
```

### 4. Filter by Authenticated User

```javascript
// ✅ Good - User sees only their data
const crops = await Crop.find({ 
  farmerId: req.user._id 
});

// ❌ Bad - Return all data
const crops = await Crop.find();
```

### 5. Use Authorization Middleware

```javascript
// ✅ Good - Role-based access control
router.post('/crops/analyze', 
  authenticate, 
  authorize('farmer'), 
  handler
);

// ❌ Bad - No role verification
router.post('/crops/analyze', 
  authenticate,  // Any authenticated user can access
  handler
);
```

## Migration Notes

### Previous Implementation
- Used String type for `farmerId` and `buyerId`
- No referential integrity
- Manual validation required
- Inconsistent data types across models

### Current Implementation
- Uses ObjectId references for all user IDs
- Automatic referential integrity
- Database-level validation
- Consistent data model

### Breaking Changes
- Existing crop and request records need migration if using string IDs
- Frontend should expect populated user objects in responses
- Authorization checks now use ObjectId comparisons

## Testing User ID Linking

### 1. Create Test Users
```javascript
// Farmer
POST /api/auth/register
{
  "name": "Test Farmer",
  "email": "farmer@test.com",
  "password": "password123",
  "role": "farmer"
}

// Buyer
POST /api/auth/register
{
  "name": "Test Buyer",
  "email": "buyer@test.com",
  "password": "password123",
  "role": "buyer"
}
```

### 2. Test Crop Creation (Farmer)
```javascript
POST /api/crops/analyze
Authorization: Bearer <farmer_token>
{
  "cropType": "wheat",
  "quantity": 100,
  "price": 25
}

// Response includes farmerId as ObjectId
```

### 3. Test Request Creation (Buyer)
```javascript
POST /api/requests
Authorization: Bearer <buyer_token>
{
  "farmerId": "507f1f77bcf86cd799439011",
  "cropName": "wheat",
  "requestedQuantity": 50,
  "offerPrice": 24
}

// System validates farmer exists
// Auto-assigns buyerId from token
```

### 4. Verify Population
```javascript
GET /api/requests/farmer/my-requests
Authorization: Bearer <farmer_token>

// Response includes populated buyer info
{
  "data": [{
    "buyerId": {
      "_id": "...",
      "name": "Test Buyer",
      "email": "buyer@test.com"
    },
    "farmerId": {
      "_id": "...",
      "name": "Test Farmer"
    }
  }]
}
```

## Common Error Scenarios

### 1. Invalid User ID
```javascript
POST /api/requests
{
  "farmerId": "invalid-id"
}

// Response: 404 Farmer not found
```

### 2. Unauthorized Access
```javascript
PUT /api/crops/123  // Crop belongs to different farmer
Authorization: Bearer <different_farmer_token>

// Response: 403 Not authorized
```

### 3. Role Mismatch
```javascript
POST /api/crops/analyze  // Requires farmer role
Authorization: Bearer <buyer_token>

// Response: 403 Access denied
```

## Future Enhancements

### 1. User Verification
- Email verification before allowing transactions
- Phone verification for high-value orders
- KYC for farmers above threshold

### 2. User Ratings
- Buyer ratings for farmers
- Farmer ratings for buyers
- Linked to user IDs for authenticity

### 3. User Analytics
- Track user behavior patterns
- Generate insights per user
- Personalized recommendations

### 4. User Relationships
- Follow favorite farmers
- Preferred buyer lists
- All linked via user IDs

## Related Documentation

- [API Documentation](../backend/API_DOCUMENTATION.md)
- [Database Architecture](../backend/DATABASE_ARCHITECTURE.md)
- [Authentication Guide](AUTH_SYSTEM.md)
- [Messaging Implementation](MESSAGING_IMPLEMENTATION_SUMMARY.md)

---

**Last Updated:** February 6, 2026  
**Maintained By:** HarvestHub Development Team
