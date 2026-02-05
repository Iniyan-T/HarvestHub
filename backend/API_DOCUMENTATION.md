# HarvestHub Buyer Database API Documentation

## Overview
Complete buyer-side database implementation for the HarvestHub agricultural marketplace with JWT authentication, role-based access control, and comprehensive features.

## Database Models

### 1. User Model
- **Purpose**: Store user information for both buyers and farmers
- **Fields**: name, email, phone, password (hashed), role, address, profileImage, isActive
- **Roles**: buyer, farmer, admin
- **Password**: Uses bcryptjs hashing with auto-comparison method

### 2. BuyerProfile Model
- **Purpose**: Store buyer-specific information
- **Fields**: companyName, companyType, businessRegistration, taxId, bankDetails, UPI, paymentMethod
- **Linked to**: User model via userId

### 3. FarmerProfile Model
- **Purpose**: Store farmer-specific information
- **Fields**: farmName, farmSize, cropsProduced, bankDetails, UPI, certifications
- **Linked to**: User model via userId

### 4. PurchaseOrder Model
- **Purpose**: Track buyer purchase orders from farmers
- **Fields**: orderNumber, buyerId, farmerId, cropId, quantity, totalAmount, status, paymentStatus
- **Order Flow**: pending → accepted → payment_pending → payment_confirmed → ready_for_delivery → in_transit → delivered
- **Auto-generated**: orderNumber (PO-{timestamp}-{count})

### 5. Message Model
- **Purpose**: Direct messaging between buyer and farmer
- **Fields**: senderId, receiverId, conversationId, message, messageType, isRead
- **Message Types**: text, image, file
- **Indexed**: For efficient conversation queries

### 6. Transport Model
- **Purpose**: Track delivery with ETA calculation
- **Fields**: orderId, pickupLocation, deliveryLocation, estimatedDeliveryDate, status
- **ETA Calculation**: Uses Haversine formula based on coordinates (50 km/h avg speed)
- **Tracking**: temperature, humidity, currentLocation, photos

### 7. Wishlist Model
- **Purpose**: Save favorite crops and farmers
- **Fields**: buyerId, crops[], farmers[]
- **Operations**: Add/remove crops and farmers

### 8. Transaction Model
- **Purpose**: Record payment transactions
- **Fields**: orderId, amount, paymentMethod, paymentDate, status
- **Transaction Types**: payment, refund, adjustment
- **Auto-generated**: transactionId (TXN-{timestamp}-{count})

---

## API Endpoints

### Authentication Routes (`/api/auth`)

#### 1. Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Buyer",
  "email": "buyer@example.com",
  "phone": "+919876543210",
  "password": "secure_password",
  "confirmPassword": "secure_password",
  "role": "buyer",
  "address": {
    "street": "123 Market St",
    "city": "Bangalore",
    "state": "Karnataka",
    "zipCode": "560001",
    "country": "India",
    "latitude": 12.9716,
    "longitude": 77.5946
  }
}

Response: { token, user }
```

#### 2. Login
```
POST /api/auth/login
{
  "email": "buyer@example.com",
  "password": "secure_password"
}

Response: { token, user }
```

#### 3. Get My Profile
```
GET /api/auth/me
Authorization: Bearer {token}

Response: { user, profile }
```

#### 4. Update Profile
```
PUT /api/auth/update-profile
Authorization: Bearer {token}
{
  "name": "Jane Buyer",
  "phone": "+919876543211",
  "address": { ... }
}
```

#### 5. Update Buyer Profile (Additional Info)
```
PUT /api/auth/buyer/update-profile
Authorization: Bearer {token}
{
  "companyName": "ABC Traders",
  "companyType": "Wholesaler",
  "businessRegistration": "REG123",
  "preferredCrops": ["wheat", "rice", "paddy"],
  "bankDetails": {
    "accountHolder": "John Buyer",
    "accountNumber": "1234567890",
    "bankName": "HDFC Bank",
    "ifscCode": "HDFC0001234"
  }
}
```

#### 6. Change Password
```
POST /api/auth/change-password
Authorization: Bearer {token}
{
  "currentPassword": "old_password",
  "newPassword": "new_password",
  "confirmPassword": "new_password"
}
```

---

### Purchase Orders Routes (`/api/buyer/orders`)

#### 1. Create Purchase Order
```
POST /api/buyer/orders/create
Authorization: Bearer {token}
{
  "farmerId": "507f1f77bcf86cd799439011",
  "cropId": "507f191e810c19729de860ea",
  "quantity": 500,
  "unit": "kg",
  "pricePerUnit": 50,
  "quality": {
    "description": "Premium quality",
    "requirements": ["Grade A", "Fresh"]
  },
  "notes": "Delivery needed by Friday"
}

Response: { success: true, order }
```

#### 2. Get My Orders
```
GET /api/buyer/orders/my-orders?status=pending&skip=0&limit=10
Authorization: Bearer {token}

Response: { data: [], pagination: {} }
```

#### 3. Get Order Details
```
GET /api/buyer/orders/{orderId}
Authorization: Bearer {token}

Response: { data: order }
```

#### 4. Update Order (Before Farmer Accepts)
```
PUT /api/buyer/orders/{orderId}/update
Authorization: Bearer {token}
{
  "quantity": 600,
  "pricePerUnit": 45,
  "notes": "Quantity updated"
}
```

#### 5. Accept Order (Farmer Action)
```
PUT /api/buyer/orders/{orderId}/accept
Authorization: Bearer {farmer_token}

Response: { success: true, order }
```

#### 6. Reject Order (Farmer Action)
```
PUT /api/buyer/orders/{orderId}/reject
Authorization: Bearer {farmer_token}
{
  "reason": "Cannot fulfill this quantity"
}
```

---

### Messages Routes (`/api/messages`)

#### 1. Send Message
```
POST /api/messages/send
Authorization: Bearer {token}
{
  "receiverId": "507f1f77bcf86cd799439011",
  "message": "Is this wheat available?",
  "messageType": "text",
  "relatedOrderId": "507f191e810c19729de860ea"
}

Response: { success: true, data: message }
```

#### 2. Get Conversation with User
```
GET /api/messages/conversation/{userId}?skip=0&limit=50
Authorization: Bearer {token}

Response: { data: [], pagination: {} }
```

#### 3. Get All Conversations
```
GET /api/messages/conversations?skip=0&limit=10
Authorization: Bearer {token}

Response: { data: [], pagination: {} }
```

#### 4. Get Unread Count
```
GET /api/messages/unread-count
Authorization: Bearer {token}

Response: { unreadCount: 5 }
```

#### 5. Delete Message
```
DELETE /api/messages/{messageId}
Authorization: Bearer {token}

Response: { success: true }
```

---

### Wishlist Routes (`/api/wishlist`)

#### 1. Get Wishlist
```
GET /api/wishlist
Authorization: Bearer {token}

Response: { data: { crops: [], farmers: [] } }
```

#### 2. Add Crop to Wishlist
```
POST /api/wishlist/crops/add
Authorization: Bearer {token}
{
  "cropId": "507f191e810c19729de860ea"
}

Response: { success: true, data: wishlist }
```

#### 3. Remove Crop from Wishlist
```
POST /api/wishlist/crops/remove
Authorization: Bearer {token}
{
  "cropId": "507f191e810c19729de860ea"
}
```

#### 4. Add Farmer to Wishlist
```
POST /api/wishlist/farmers/add
Authorization: Bearer {token}
{
  "farmerId": "507f1f77bcf86cd799439011"
}
```

#### 5. Remove Farmer from Wishlist
```
POST /api/wishlist/farmers/remove
Authorization: Bearer {token}
{
  "farmerId": "507f1f77bcf86cd799439011"
}
```

---

### Transport Routes (`/api/transport`)

#### 1. Schedule Transport (Farmer)
```
POST /api/transport/schedule
Authorization: Bearer {farmer_token}
{
  "orderId": "507f191e810c19729de860ea",
  "pickupDate": "2026-02-10T10:00:00Z",
  "transportProvider": {
    "name": "Express Logistics",
    "phone": "+919876543210",
    "vehicleNumber": "MH01AB1234",
    "vehicleType": "refrigerated truck"
  },
  "pickupLocation": {
    "address": "Farm A, Village",
    "city": "Belgaum",
    "latitude": 15.8497,
    "longitude": 75.7252
  },
  "deliveryLocation": {
    "address": "123 Market St",
    "city": "Bangalore",
    "latitude": 12.9716,
    "longitude": 77.5946
  }
}

Response: { order with ETA calculated }
```

#### 2. Get Transport Details
```
GET /api/transport/order/{orderId}
Authorization: Bearer {token}

Response: { data: transport }
```

#### 3. Update Transport Status
```
PUT /api/transport/{transportId}/status
Authorization: Bearer {farmer_token}
{
  "status": "in_transit",
  "currentLocation": {
    "latitude": 13.5,
    "longitude": 76.5
  },
  "notes": "On the way, ETA 2 hours"
}
```

#### 4. Add Monitoring Data (Temperature, Humidity)
```
PUT /api/transport/{transportId}/monitoring
Authorization: Bearer {farmer_token}
{
  "temperature": 4,
  "humidity": 65,
  "photos": ["url1", "url2"]
}
```

#### 5. Get My Transports (Farmer)
```
GET /api/transport/farmer/my-transports?status=in_transit&skip=0&limit=10
Authorization: Bearer {farmer_token}

Response: { data: [], pagination: {} }
```

#### 6. Get My Transports (Buyer)
```
GET /api/transport/buyer/my-transports?status=delivered&skip=0&limit=10
Authorization: Bearer {buyer_token}

Response: { data: [], pagination: {} }
```

---

### Transactions Routes (`/api/transactions`)

#### 1. Record Payment
```
POST /api/transactions/record-payment
Authorization: Bearer {buyer_token}
{
  "orderId": "507f191e810c19729de860ea",
  "amount": 25000,
  "paymentMethod": "bank_transfer",
  "referenceNumber": "REF123456",
  "bankDetails": {
    "bankName": "HDFC Bank",
    "transferDate": "2026-02-05T10:30:00Z"
  }
}

Response: { success: true, data: transaction }
```

#### 2. Get My Transactions
```
GET /api/transactions/my-transactions?status=completed&skip=0&limit=10
Authorization: Bearer {token}

Response: { data: [], pagination: {} }
```

#### 3. Get Transaction Details
```
GET /api/transactions/{transactionId}
Authorization: Bearer {token}

Response: { data: transaction }
```

#### 4. Get Transaction Statistics
```
GET /api/transactions/stats/summary
Authorization: Bearer {token}

Response: {
  totalAmount: 100000,
  totalTransactions: 5,
  completedTransactions: 4,
  pendingTransactions: 1
}
```

#### 5. Get All Transactions (Admin)
```
GET /api/transactions/admin/all-transactions?skip=0&limit=20
Authorization: Bearer {admin_token}

Response: { data: [], pagination: {} }
```

---

## Authentication

### JWT Token Usage
```
Authorization Header: Bearer {token}
```

### Token Payload
```json
{
  "id": "507f1f77bcf86cd799439011",
  "role": "buyer",
  "iat": 1707119400,
  "exp": 1707724200
}
```

---

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

### Common Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Server Error

---

## ETA Calculation

### Formula Used
Haversine formula to calculate distance between two coordinates:
- **Distance**: Using latitude/longitude
- **Speed**: Assumed 50 km/h for rural transport
- **ETA**: distance / 50 = hours

### Example
```
Pickup: Belgaum (15.8497°N, 75.7252°E)
Delivery: Bangalore (12.9716°N, 77.5946°E)
Distance: ~300 km
ETA: 6 hours approximately
```

---

## Order Flow

```
┌─────────────────────────────────────────────────────┐
│ Buyer Creates Purchase Order                        │
│ Status: pending                                     │
└──────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│ Farmer Accepts Order                                │
│ Status: accepted                                    │
└──────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│ Buyer Confirms Payment                              │
│ Status: payment_pending → payment_confirmed         │
└──────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│ Transport Scheduled (ETA Calculated)                │
│ Status: ready_for_delivery                          │
└──────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│ Transport Dispatched                                │
│ Status: in_transit                                  │
└──────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│ Delivery Completed                                  │
│ Status: delivered                                   │
└──────────────────────────────────────────────────────┘
```

---

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Update `.env` file with:
- MongoDB URI (✅ Already configured)
- JWT Secret
- Gemini API Key
- Port number

### 3. Start Server
```bash
npm run dev  # Development with nodemon
npm start    # Production
```

### 4. Test Endpoints
Use Postman or any HTTP client with Bearer token authentication.

---

## Best Practices

1. **Always include Authorization header** with Bearer token
2. **Validate email format** on registration
3. **Use HTTPS** in production
4. **Rotate JWT secret** regularly
5. **Monitor temperature/humidity** during transport for temperature-sensitive crops
6. **Archive old transactions** for performance
7. **Index frequently queried fields** in MongoDB
8. **Implement rate limiting** for API endpoints
9. **Add request validation** middleware
10. **Log all API calls** for audit trail

