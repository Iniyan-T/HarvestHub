# 🌾 HarvestHub API Endpoints Documentation

Complete API reference for all 8 database layers.

---

## 📋 Quick Reference Table

| Layer | Module | Base URL | Status |
|-------|--------|----------|--------|
| 1 | User & Access | `/api/auth` | ✅ Existing |
| 2 | Farmer Assets | `/api/crops` | ✅ Existing |
| 3 | AI Quality | `/api/quality` | ✨ **NEW** |
| 4 | Transactions | `/api/buyer/orders`, `/api/requests` | ✅ Existing |
| 5 | Transport | `/api/transport` | ✅ Existing |
| 6 | IoT Storage | `/api/storage` | ✨ **NEW** |
| 7 | Communication | `/api/messages`, `/api/notifications` | ✅ Existing / ✨ **NEW** |
| 8 | Admin/Analytics | `/api/admin` | ✨ **NEW** |

---

## **LAYER 1: USER & ACCESS** (`/api/auth`)

### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Farmer",
  "email": "john@farm.com",
  "phone": "+919876543210",
  "password": "securepass123",
  "confirmPassword": "securepass123",
  "role": "farmer",
  "address": {
    "street": "123 Farm Lane",
    "city": "Bangalore",
    "state": "Karnataka",
    "zipCode": "560001",
    "country": "India"
  }
}

Response: { success: true, token: "JWT_TOKEN", user: {...} }
```

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@farm.com",
  "password": "securepass123"
}

Response: { success: true, token: "JWT_TOKEN", user: {...} }
```

### Get Current User
```
GET /api/auth/me
Authorization: Bearer JWT_TOKEN

Response: { success: true, data: { userId, name, email, role, ... } }
```

---

## **LAYER 2: FARMER ASSETS** (`/api/crops`)

### List All Crops
```
GET /api/crops

Query Parameters:
  - status: 'available' | 'sold' | 'reserved'
  - cropName: string
  - minPrice: number
  - maxPrice: number
  - farmerId: string (ObjectId)
  - limit: number (default 20)
  - skip: number (default 0)

Response: { success: true, data: [{...crops...}], count: 5 }
```

### Get Single Crop
```
GET /api/crops/:cropId

Response: { success: true, data: {...crop details...} }
```

### Create Crop (with Image & AI Analysis)
```
POST /api/crops/analyze
Content-Type: multipart/form-data
Authorization: Bearer JWT_TOKEN

Form Data:
  - image: File (JPEG/PNG, max 5MB)
  - cropType: string
  - quantity: number
  - price: number
  - farmerId: string

Response: {
  success: true,
  data: {
    cropId: "...",
    aiGrade: {
      grade: "A",
      confidence: 85,
      qualityScore: 92,
      defects: [],
      freshness: "Excellent"
    }
  }
}
```

### Update Crop
```
PUT /api/crops/:cropId
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "quantity": 150,
  "price": 450,
  "status": "available"
}

Response: { success: true, data: {...updated crop...} }
```

### Delete Crop
```
DELETE /api/crops/:cropId
Authorization: Bearer JWT_TOKEN

Response: { success: true, message: "Crop deleted successfully" }
```

### Get Farmer's Crops
```
GET /api/crops/farmer/:farmerId

Response: { success: true, data: [{...crops...}], count: 8 }
```

---

## **LAYER 3: AI QUALITY & INTELLIGENCE** (`/api/quality`) ✨ NEW

### Get Crop Quality Analysis
```
GET /api/quality/quality/:cropId

Response: {
  success: true,
  data: {
    batchId: "BATCH_001",
    cropId: "...",
    grade: "A",
    confidenceScore: 85,
    qualityScore: 92,
    defects: [],
    freshness: "Excellent",
    aiRemarks: "High quality crop, ready for market",
    analyzedAt: "2026-02-05T10:30:00Z",
    modelUsed: "gemini"
  }
}
```

### Get All Quality Records for Farmer
```
GET /api/quality/quality/farmer/:farmerId
Authorization: Bearer JWT_TOKEN

Response: {
  success: true,
  count: 5,
  data: [{...quality records...}]
}
```

### Create Quality Record (from AI analysis)
```
POST /api/quality/quality
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "cropId": "507f1f77bcf86cd799439011",
  "farmerId": "507f1f77bcf86cd799439012",
  "batchId": "BATCH_2026_001",
  "grade": "A",
  "confidenceScore": 85,
  "qualityScore": 92,
  "defects": [],
  "freshness": "Excellent",
  "aiRemarks": "High quality analysis",
  "modelUsed": "gemini"
}

Response: { success: true, message: "Quality record created", data: {...} }
```

### Get Price Prediction for Crop Type
```
GET /api/quality/price/:cropType

Example: GET /api/quality/price/Tomato

Response: {
  success: true,
  data: {
    cropType: "Tomato",
    currentPrice: 45,
    predictedPrice: 52,
    trend: "up",
    confidence: 78,
    bestSellTime: "Next 7 days",
    priceChangePercent: 15.6,
    nextUpdate: "2026-02-12T10:30:00Z"
  }
}
```

### Get All Price Predictions
```
GET /api/quality/price/list/all

Response: {
  success: true,
  count: 15,
  data: [{...predictions...}]
}
```

### Create/Update Price Prediction
```
POST /api/quality/price
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "cropType": "Tomato",
  "currentPrice": 45,
  "predictedPrice": 52,
  "trend": "up",
  "confidence": 78,
  "bestSellTime": "Next 7 days",
  "priceChangePercent": 15.6,
  "modelUsed": "statistical"
}

Response: { success: true, message: "Price prediction created", data: {...} }
```

### Delete Quality Record
```
DELETE /api/quality/quality/:qualityId
Authorization: Bearer JWT_TOKEN

Response: { success: true, message: "Quality record deleted" }
```

---

## **LAYER 4: TRANSACTIONS & REQUESTS** (Existing)

### Create Purchase Request
```
POST /api/requests
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "farmerId": "507f1f77bcf86cd799439011",
  "buyerId": "507f1f77bcf86cd799439012",
  "buyerName": "John Buyer",
  "buyerContact": "+919876543210",
  "cropName": "Tomato",
  "requestedQuantity": 500,
  "offerPrice": 40,
  "notes": "Need fresh tomatoes"
}

Response: { success: true, message: "Request created successfully", data: {...} }
```

### Get Farmer's Requests
```
GET /api/requests/farmer/:farmerId

Response: { success: true, data: [{...requests...}], count: 12 }
```

### Get Buyer's Requests
```
GET /api/requests/buyer/:buyerId

Response: { success: true, data: [{...requests...}], count: 8 }
```

### Update Request Status
```
PUT /api/requests/:requestId
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "status": "accepted",
  "notes": "Accepted, delivery in 2 days"
}

Response: { success: true, message: "Request updated", data: {...} }
```

### Create Purchase Order
```
POST /api/buyer/orders
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "buyerId": "507f1f77bcf86cd799439012",
  "farmerId": "507f1f77bcf86cd799439011",
  "cropId": "507f1f77bcf86cd799439013",
  "quantity": 500,
  "unit": "kg",
  "pricePerUnit": 40,
  "totalAmount": 20000
}

Response: { success: true, message: "Order created", data: {...} }
```

---

## **LAYER 5: TRANSPORT & DELIVERY** (Existing)

### Create Transport Details
```
POST /api/transport
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "orderId": "507f1f77bcf86cd799439014",
  "transportProvider": {
    "name": "TruckLoads India",
    "phone": "+919876543210",
    "vehicleNumber": "KA-01-AB-1234",
    "vehicleType": "Refrigerated Truck"
  },
  "pickupLocation": {
    "address": "123 Farm Lane",
    "city": "Bangalore",
    "state": "Karnataka",
    "latitude": 12.9716,
    "longitude": 77.5946
  },
  "deliveryLocation": {
    "address": "456 Market St",
    "city": "Chennai",
    "state": "Tamil Nadu",
    "latitude": 13.0827,
    "longitude": 80.2707
  },
  "pickupDate": "2026-02-06T10:00:00Z",
  "estimatedDeliveryDate": "2026-02-07T18:00:00Z"
}

Response: { success: true, data: {...} }
```

### Get Transport Details
```
GET /api/transport/:orderId

Response: { success: true, data: {...transport details...} }
```

### Update Transport Status
```
PUT /api/transport/:transportId
Authorization: Bearer JWT_TOKEN

{
  "dispatchStatus": "in_transit",
  "actualDeliveryDate": "2026-02-07T17:30:00Z"
}

Response: { success: true, data: {...} }
```

---

## **LAYER 6: IOT STORAGE MONITORING** (`/api/storage`) ✨ NEW

### Get Storage Readings for Batch
```
GET /api/storage/readings/:batchId

Query Parameters:
  - limit: number (default 100)

Response: {
  success: true,
  count: 45,
  data: [
    {
      readingId: "...",
      batchId: "BATCH_001",
      temperature: 12.5,
      humidity: 75.3,
      gasLevel: { co2: 0.5, o2: 20.8, ethylene: 0.02 },
      deviceId: "ESP32_001",
      location: "Cold Storage A",
      status: "normal",
      timestamp: "2026-02-05T10:30:00Z"
    }
  ]
}
```

### Get Latest Reading for Batch
```
GET /api/storage/readings/latest/:batchId

Response: { success: true, data: {...latest reading...} }
```

### Post New Storage Reading (from IoT device)
```
POST /api/storage/readings
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "batchId": "BATCH_001",
  "cropId": "507f1f77bcf86cd799439013",
  "farmerId": "507f1f77bcf86cd799439011",
  "temperature": 12.5,
  "humidity": 75.3,
  "gasLevel": {
    "co2": 0.5,
    "ethylene": 0.02
  },
  "deviceId": "ESP32_001",
  "location": "Cold Storage A",
  "status": "normal"
}

Response: { success: true, message: "Storage reading recorded", data: {...} }
```

### Get Storage Alerts for Batch
```
GET /api/storage/alerts/:batchId

Response: {
  success: true,
  count: 2,
  data: [
    {
      alertId: "...",
      alertType: "temperature",
      severity: "warning",
      message: "Temperature slightly elevated: 28°C",
      threshold: { parameter: "temperature", expected: 12, actual: 28 },
      resolved: false,
      createdAt: "2026-02-05T09:15:00Z"
    }
  ]
}
```

### Get Active Alerts for Farmer
```
GET /api/storage/alerts/farmer/:farmerId
Authorization: Bearer JWT_TOKEN

Response: {
  success: true,
  count: 1,
  data: [{...active alerts...}]
}
```

### Create Storage Alert
```
POST /api/storage/alerts
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "batchId": "BATCH_001",
  "cropId": "507f1f77bcf86cd799439013",
  "farmerId": "507f1f77bcf86cd799439011",
  "alertType": "temperature",
  "severity": "warning",
  "message": "Temperature slightly elevated",
  "threshold": {
    "parameter": "temperature",
    "expected": 12,
    "actual": 28
  },
  "recommendedAction": "Adjust cooling system"
}

Response: { success: true, message: "Storage alert created", data: {...} }
```

### Resolve Storage Alert
```
PATCH /api/storage/alerts/:alertId/resolve
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "action": "Cooling system adjusted and restarted"
}

Response: { success: true, message: "Alert resolved", data: {...} }
```

### Get Storage Health Summary
```
GET /api/storage/health/:batchId

Response: {
  success: true,
  data: {
    temperature: 12.5,
    humidity: 75.3,
    gasLevels: { co2: 0.5, o2: 20.8 },
    status: "normal",
    activeAlerts: 0,
    lastUpdate: "2026-02-05T10:45:00Z"
  }
}
```

---

## **LAYER 7: COMMUNICATION** (`/api/messages`, `/api/notifications`)

### Send Message
```
POST /api/messages
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "senderId": "507f1f77bcf86cd799439011",
  "receiverId": "507f1f77bcf86cd799439012",
  "message": "Are you available for crop delivery?",
  "messageType": "text",
  "relatedCrop": "507f1f77bcf86cd799439013"
}

Response: { success: true, message: "Message sent", data: {...} }
```

### Get Messages (Conversation)
```
GET /api/messages/conversation/:conversationId

Query Parameters:
  - limit: number (default 20)
  - skip: number (default 0)

Response: { success: true, data: [{...messages...}], count: 8 }
```

### Get All Notifications  ✨ NEW
```
GET /api/notifications
Authorization: Bearer JWT_TOKEN

Query Parameters:
  - limit: number (default 20)
  - skip: number (default 0)

Response: {
  success: true,
  data: [
    {
      notificationId: "...",
      type: "request",
      title: "New Purchase Request",
      message: "Buyer John sent new purchase request",
      priority: "high",
      readStatus: false,
      createdAt: "2026-02-05T10:30:00Z"
    }
  ],
  pagination: { total: 25, unread: 5 }
}
```

### Get Unread Notifications Count  ✨ NEW
```
GET /api/notifications/unread/count
Authorization: Bearer JWT_TOKEN

Response: { success: true, unreadCount: 5 }
```

### Create Notification  ✨ NEW
```
POST /api/notifications
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "userId": "507f1f77bcf86cd799439011",
  "type": "request",
  "title": "New Purchase Request",
  "message": "Buyer John sent a new purchase request for 500kg tomato",
  "relatedId": "507f1f77bcf86cd799439014",
  "relatedModel": "Request",
  "actionUrl": "/requests/507f1f77bcf86cd799439014",
  "priority": "high"
}

Response: { success: true, message: "Notification created", data: {...} }
```

### Mark Notification as Read  ✨ NEW
```
PATCH /api/notifications/:notificationId/read
Authorization: Bearer JWT_TOKEN

Response: { success: true, message: "Notification marked as read", data: {...} }
```

### Mark All Notifications as Read  ✨ NEW
```
PATCH /api/notifications/read/all
Authorization: Bearer JWT_TOKEN

Response: { success: true, message: "All notifications marked as read", modified: 5 }
```

### Archive Notification  ✨ NEW
```
PATCH /api/notifications/:notificationId/archive
Authorization: Bearer JWT_TOKEN

Response: { success: true, message: "Notification archived", data: {...} }
```

### Delete Notification  ✨ NEW
```
DELETE /api/notifications/:notificationId
Authorization: Bearer JWT_TOKEN

Response: { success: true, message: "Notification deleted" }
```

---

## **LAYER 8: ADMIN & ANALYTICS** (`/api/admin`) ✨ NEW

### Get API Logs
```
GET /api/admin/logs
Authorization: Bearer JWT_TOKEN (Admin only)

Query Parameters:
  - limit: number (default 100)
  - skip: number (default 0)
  - endpoint: string (optional filter)
  - userRole: string (optional filter)

Response: {
  success: true,
  data: [
    {
      endpoint: "POST /api/crops/analyze",
      method: "POST",
      statusCode: 200,
      responseTime: 2450,
      userRole: "farmer",
      timestamp: "2026-02-05T10:30:00Z"
    }
  ],
  pagination: { total: 1245 }
}
```

### Get API Statistics
```
GET /api/admin/logs/stats
Authorization: Bearer JWT_TOKEN (Admin only)

Response: {
  success: true,
  data: [
    {
      endpoint: "GET /api/crops",
      count: 450,
      avgResponseTime: 125,
      errors: 3
    }
  ]
}
```

### Post API Log (middleware integration)
```
POST /api/admin/logs
Content-Type: application/json

{
  "endpoint": "POST /api/crops/analyze",
  "method": "POST",
  "statusCode": 200,
  "responseTime": 2450,
  "userId": "507f1f77bcf86cd799439011",
  "userRole": "farmer",
  "ipAddress": "192.168.1.1",
  "success": true
}

Response: { success: true, message: "API log recorded" }
```

### Get Daily Analytics
```
GET /api/admin/analytics/:date
Authorization: Bearer JWT_TOKEN (Admin only)

Example: GET /api/admin/analytics/2026-02-05

Response: {
  success: true,
  data: {
    date: "2026-02-05",
    totalUsers: 342,
    activeUsers: 128,
    totalFarmers: 145,
    totalBuyers: 197,
    totalCrops: 1250,
    availableCrops: 980,
    soldCrops: 270,
    totalOrders: 85,
    completedOrders: 72,
    pendingOrders: 13,
    totalRevenue: 425000,
    avgOrderValue: 5000
  }
}
```

### Get Latest Analytics
```
GET /api/admin/analytics/latest
Authorization: Bearer JWT_TOKEN (Admin only)

Response: { success: true, data: {...analytics data...} }
```

### Get Analytics Range
```
GET /api/admin/analytics/range
Authorization: Bearer JWT_TOKEN (Admin only)

Query Parameters:
  - startDate: "2026-02-01"
  - endDate: "2026-02-05"
  - limit: number (default 30)

Response: {
  success: true,
  count: 5,
  data: [{...analytics...}]
}
```

### Generate Daily Analytics
```
POST /api/admin/analytics/generate
Authorization: Bearer JWT_TOKEN (Admin only)

Response: {
  success: true,
  message: "Analytics created",
  data: {...new analytics...}
}
```

### Get System Health
```
GET /api/admin/system/health
Authorization: Bearer JWT_TOKEN (Admin only)

Response: {
  success: true,
  data: {
    status: "healthy",
    errorRate: 0.5,
    avgResponseTime: 245,
    apiCallsLast24h: 5432,
    errorsLast24h: 27
  }
}
```

---

## 🔐 Authentication

All endpoints marked with `Authorization: Bearer JWT_TOKEN` require:
1. User must be authenticated
2. Valid JWT token in Authorization header
3. Admin-only endpoints also require `role: "admin"`

### JWT Token Format
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...},
  "pagination": {
    "total": 100,
    "limit": 20,
    "skip": 0
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

---

## 🔄 Query Pagination Pattern

Most list endpoints support:
```
GET /api/resource?limit=20&skip=0
```

- `limit`: Number of results per page (default 20)
- `skip`: Number of results to skip (default 0)

### Pagination Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "limit": 20,
    "skip": 0
  }
}
```

---

## 📝 Notification Types

| Type | Use Case | Priority |
|------|----------|----------|
| `request` | New purchase request | Medium/High |
| `order` | Order status update | High |
| `transport` | Delivery update | High |
| `payment` | Payment notification | Critical |
| `alert` | Storage/IoT alert | Critical |
| `message` | Direct message | Medium |
| `system` | System notification | Low |
| `quality` | Quality analysis result | Medium |

---

## 🎯 Alert Severity Levels

| Severity | Meaning | Action Required |
|----------|---------|-----------------|
| `critical` | Immediate action needed | Automatic notification + SMS |
| `warning` | Monitor and prepare | Push notification |
| `info` | Informational only | In-app only |

---

## Last Updated
February 5, 2026

## Status
✅ All endpoints documented and ready for client integration
