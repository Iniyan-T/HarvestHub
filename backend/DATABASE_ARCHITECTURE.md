# 🌾 HarvestHub — Database Architecture & Workflow Layers

This document outlines the 7-layer database architecture for HarvestHub, organizing collections by responsibility and workflow.

---

## 🧱 **LAYER 1: USER & ACCESS LAYER** (Identity + Roles)

### 📌 Purpose
Who is using the system and what they're allowed to do.

### Collections
- `users`

### Stored Data
| Field | Type | Purpose |
|-------|------|---------|
| `userId` | ObjectId | Primary key |
| `name` | String | User full name |
| `email` | String | Unique email address |
| `phone` | String | Contact number |
| `passwordHash` | String | Bcrypt hashed password |
| `role` | String | `farmer` / `buyer` / `admin` |
| `address` | Object | Location data |
| `profileImage` | String | Profile photo URL |
| `isActive` | Boolean | Account status |
| `createdAt` | Date | Registration timestamp |

### Workflow
```
Register → Validate Email/Phone → Hash Password → Save User → Assign Role → JWT Token → Login
```

### Why It Matters
- ✅ Role-based access control
- ✅ Secure API endpoint protection
- ✅ Multilingual experience per user
- ✅ Account status management

---

## 🌾 **LAYER 2: FARMER ASSET LAYER** (Crops & Inventory)

### 📌 Purpose
Digitally represent farmer harvests and inventory.

### Collections
- `crops`
- `farmer_profiles`

### Crop Data
| Field | Type | Purpose |
|-------|------|---------|
| `cropId` | ObjectId | Primary key |
| `farmerId` | Ref → User | Link to farmer |
| `cropName` | String | Type of crop |
| `quantity` | Number | Available amount (kg) |
| `price` | Number | Price per kg |
| `imageUrl` | String | Crop image |
| `harvestDate` | Date | Harvest timestamp |
| `location` | Object | Farm location |
| `status` | String | `available` / `sold` / `reserved` |
| `createdAt` | Date | Listing timestamp |

### Farmer Profile Data
| Field | Type | Purpose |
|-------|------|---------|
| `userId` | Ref → User | Link to user account |
| `farmName` | String | Farm name |
| `farmSize` | Number | Size in acres |
| `soilType` | String | Soil type data |
| `cropsProduced` | [String] | Array of crop types |
| `yearsOfExperience` | Number | Farmer experience |
| `totalCropsListed` | Number | Listing count |
| `totalSales` | Number | Sales count |
| `totalEarnings` | Number | Revenue earned |
| `rating` | Number | Farmer rating (0-5) |
| `verificationStatus` | String | `pending` / `verified` / `rejected` |

### Workflow
```
Farmer adds crop → Validate data → Store → Visible to buyers → Crop searchable
```

### Why It Matters
- ✅ Marketplace foundation
- ✅ Real-time stock management
- ✅ Price transparency
- ✅ Farmer credibility tracking

---

## 🤖 **LAYER 3: AI QUALITY & INTELLIGENCE LAYER**

### 📌 Purpose
Attach trust, quality grading, and price intelligence to crops.

### Collections
- `crop_quality`
- `price_predictions`

### Crop Quality Data
| Field | Type | Purpose |
|-------|------|---------|
| `batchId` | ObjectId | Primary key |
| `cropId` | Ref → Crop | Link to crop |
| `grade` | String | Quality grade: `A` / `B` / `C` |
| `confidenceScore` | Number | 0-100% confidence |
| `qualityScore` | Number | 0-100 overall quality |
| `defects` | [String] | Array of defect descriptions |
| `freshness` | String | `Excellent` / `Good` / `Fair` / `Poor` |
| `aiRemarks` | String | AI analysis text |
| `imageRefs` | [String] | Analysis images |
| `analyzedAt` | Date | Analysis timestamp |
| `modelUsed` | String | Which AI model (Gemini/Ollama) |

### Price Prediction Data
| Field | Type | Purpose |
|-------|------|---------|
| `predictionId` | ObjectId | Primary key |
| `cropType` | String | Crop type |
| `currentPrice` | Number | Current market price |
| `predictedPrice` | Number | Predicted price |
| `trend` | String | `up` / `down` / `stable` |
| `confidence` | Number | Prediction confidence % |
| `bestSellTime` | String | Recommended sell window |
| `data` | Object | Historical trend data |
| `nextUpdate` | Date | When prediction updates |

### Workflow
```
Image upload → AI analysis (Gemini/Ollama) → Store result → Display on crop card
                                ↓
                        Price analysis → Prediction stored → Recommendation shown
```

### Why It Matters
- ✅ Quality assurance for buyers
- ✅ Fair pricing intelligence
- ✅ Decision support for farmers
- ✅ Market trend awareness

---

## 🛒 **LAYER 4: TRANSACTION & REQUEST LAYER**

### 📌 Purpose
Connect buyers and farmers through purchase requests and orders.

### Collections
- `requests` (purchase requests)
- `purchase_orders` (orders)

### Purchase Request Data
| Field | Type | Purpose |
|-------|------|---------|
| `requestId` | ObjectId | Primary key |
| `buyerId` | Ref → User | Buyer reference |
| `farmerId` | Ref → User | Farmer reference |
| `cropId` | Ref → Crop | Crop reference |
| `cropName` | String | Crop type |
| `requestedQuantity` | Number | Qty needed (kg) |
| `offerPrice` | Number | Buyer's offer price |
| `totalAmount` | Number | Qty × Price |
| `status` | String | `pending` / `accepted` / `rejected` / `completed` |
| `createdAt` | Date | Request timestamp |
| `respondedAt` | Date | Farmer response timestamp |

### Order Data
| Field | Type | Purpose |
|-------|------|---------|
| `orderId` | ObjectId | Primary key |
| `orderNumber` | String | Unique order ref |
| `buyerId` | Ref → User | Buyer reference |
| `farmerId` | Ref → User | Farmer reference |
| `cropId` | Ref → Crop | Crop reference |
| `quantity` | Number | Order quantity |
| `pricePerUnit` | Number | Agreed price |
| `totalAmount` | Number | Total cost |
| `status` | String | Order status (see workflow) |
| `paymentStatus` | String | Payment state |
| `createdAt` | Date | Order creation |

### Workflow
```
Buyer requests → Farmer notified → Farmer accepts/rejects → 
Order created → Payment pending → Transport arranged → Delivery
```

### Why It Matters
- ✅ Direct farmer-buyer transactions
- ✅ Negotiation transparency
- ✅ Order history tracking
- ✅ Dispute resolution trail

---

## 🚛 **LAYER 5: TRANSPORT & DELIVERY LAYER**

### 📌 Purpose
Post-harvest logistics clarity and delivery tracking (not GPS-heavy).

### Collections
- `transport_details`

### Stored Data
| Field | Type | Purpose |
|-------|------|---------|
| `transportId` | ObjectId | Primary key |
| `orderId` | Ref → Order | Link to order |
| `buyerId` | Ref → User | Buyer reference |
| `farmerId` | Ref → User | Farmer reference |
| `transportProvider` | Object | Provider details |
| `pickupLocation` | Object | Farm location |
| `deliveryLocation` | Object | Buyer location |
| `pickupDate` | Date | Scheduled pickup |
| `estimatedDeliveryDate` | Date | Scheduled delivery |
| `estimatedETA` | Object | Hours/mins/distance/calculated |
| `dispatchStatus` | String | `pending` / `dispatched` / `in_transit` / `delivered` |
| `actualDeliveryDate` | Date | Actual delivery timestamp |

### Workflow
```
Order confirmed → Transport data added → Provider assigned → 
Pickup scheduled → In transit → Delivery confirmation
```

### Why It Matters
- ✅ Build trust between parties
- ✅ Logistics planning
- ✅ Buyer delivery confidence
- ✅ Post-delivery accountability

---

## 🌡 **LAYER 6: IOT STORAGE MONITORING LAYER**

### 📌 Purpose
Monitor storage conditions in real-time and reduce post-harvest spoilage.

### Collections
- `storage_readings`
- `storage_alerts`

### Storage Readings Data
| Field | Type | Purpose |
|-------|------|---------|
| `readingId` | ObjectId | Primary key |
| `batchId` | Ref → Crop | Link to crop batch |
| `temperature` | Number | °C reading |
| `humidity` | Number | % humidity |
| `gasLevel` | String | CO2 / O2 levels |
| `timestamp` | Date | Reading time |
| `deviceId` | String | IoT device identifier |
| `location` | String | Storage location |

### Storage Alerts Data
| Field | Type | Purpose |
|-------|------|---------|
| `alertId` | ObjectId | Primary key |
| `batchId` | Ref → Crop | Link to batch |
| `alertType` | String | `temperature` / `humidity` / `gas` |
| `severity` | String | `critical` / `warning` / `info` |
| `message` | String | Alert description |
| `threshold` | Object | Expected vs actual values |
| `createdAt` | Date | Alert timestamp |
| `resolved` | Boolean | Alert status |
| `action` | String | Action taken |

### Workflow
```
Sensor reads data → API endpoint → Store reading → Check thresholds → 
Alert if needed → Dashboard update → Farmer notification
```

### Why It Matters
- ✅ Reduce post-harvest loss
- ✅ Real-time awareness
- ✅ Proactive spoilage prevention
- ✅ Storage cost optimization

---

## 💬 **LAYER 7: COMMUNICATION & NOTIFICATION LAYER**

### 📌 Purpose
Keep users informed through messages and notifications.

### Collections
- `messages`
- `notifications`

### Message Data
| Field | Type | Purpose |
|-------|------|---------|
| `messageId` | ObjectId | Primary key |
| `senderId` | Ref → User | Who sent message |
| `receiverId` | Ref → User | Who receives message |
| `conversationId` | String | Conversation grouping |
| `message` | String | Message text |
| `messageType` | String | `text` / `image` / `file` |
| `attachmentUrl` | String | File/image URL |
| `isRead` | Boolean | Read status |
| `relatedCrop` | Ref → Crop | Crop context |
| `relatedOrder` | Ref → Order | Order context |
| `timestamp` | Date | Message time |

### Notification Data
| Field | Type | Purpose |
|-------|------|---------|
| `notificationId` | ObjectId | Primary key |
| `userId` | Ref → User | Target user |
| `type` | String | `request` / `order` / `transport` / `payment` / `alert` |
| `title` | String | Notification title |
| `message` | String | Notification body |
| `relatedId` | String | Reference to related entity |
| `actionUrl` | String | Where to navigate |
| `readStatus` | Boolean | Read/unread |
| `createdAt` | Date | Creation time |
| `expiresAt` | Date | Notification expiry |

### Workflow
```
Action occurs (request, order, alert) → Notification created → 
Stored in DB → App fetches → Displayed in UI → User reads → 
Marks as read → Archived or deleted
```

### Why It Matters
- ✅ Real-time user engagement
- ✅ Action awareness
- ✅ Reduced missed communications
- ✅ User experience optimization

---

## 🧠 **LAYER 8: SYSTEM & ANALYTICS LAYER**

### 📌 Purpose
Admin insights, system debugging, and performance monitoring.

### Collections
- `api_logs`
- `analytics`

### API Logs Data
| Field | Type | Purpose |
|-------|------|---------|
| `logId` | ObjectId | Primary key |
| `endpoint` | String | API endpoint called |
| `method` | String | HTTP method (GET, POST, etc.) |
| `userId` | Ref → User | User who called it |
| `userRole` | String | Role of user |
| `statusCode` | Number | Response status |
| `responseTime` | Number | ms to respond |
| `errorMessage` | String | Error if failed |
| `timestamp` | Date | Log time |
| `ipAddress` | String | Request origin |

### Analytics Data
| Field | Type | Purpose |
|-------|------|---------|
| `analyticsId` | ObjectId | Primary key |
| `date` | Date | Analytics date |
| `totalUsers` | Number | Active users |
| `totalFarmers` | Number | Farmer count |
| `totalBuyers` | Number | Buyer count |
| `totalCrops` | Number | Listed crops |
| `totalOrders` | Number | Orders created |
| `totalRevenue` | Number | Revenue generated |
| `avgOrderValue` | Number | Average order size |
| `topCrops` | [Object] | Most popular crops |
| `topFarmers` | [Object] | Top rated farmers |

### Workflow
```
Every API call → Log request → Record response → Monitor performance → 
Daily aggregation → Admin dashboard → Insights displayed
```

### Why It Matters
- ✅ System debugging
- ✅ Performance monitoring
- ✅ User behavior insights
- ✅ Admin decision support

---

## 📊 **DATABASE WORKFLOW MAP**

```
┌─────────────────────────────────────────────────────────────┐
│                     LAYER 1: USERS                           │
│              All actors authenticated here                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
   ┌────▼────────┐          ┌────────▼──────┐
   │   FARMER    │          │     BUYER     │
   │  LAYER 2    │          │   (in LAYER 4)│
   │  (Crops)    │          │               │
   └────┬────────┘          └────────┬──────┘
        │                           │
        │   ┌───────────────────────┘
        │   │
   ┌────▼───▼──────────────────┐
   │  LAYER 3: AI QUALITY      │
   │  (Grade & Price Predict)  │
   └────┬──────────────────────┘
        │
   ┌────▼──────────────────────┐
   │  LAYER 4: REQUESTS/ORDERS │
   │  (Buyer-Farmer Connect)  │
   └────┬──────────────────────┘
        │
   ┌────▼──────────────────────┐
   │  LAYER 5: TRANSPORT       │
   │  (Delivery Logistics)     │
   └────┬──────────────────────┘
        │
   ┌────▼──────────────────────┐
   │  LAYER 6: IoT MONITORING  │
   │  (Storage Conditions)     │
   └────┬──────────────────────┘
        │
   ┌────▼──────────────────────┐
   │  LAYER 7: MESSAGES/NOTIF  │
   │  (Communication)          │
   └────┬──────────────────────┘
        │
   ┌────▼──────────────────────┐
   │  LAYER 8: LOGS/ANALYTICS  │
   │  (Admin Dashboard)        │
   └───────────────────────────┘
```

---

## 🗂️ **Model Files Location**

All models are located in `/backend/models/`:

### Layer 1 (User & Access)
- `User.js` - Core user account model

### Layer 2 (Farmer Assets)
- `Crop.js` - Crop listings
- `FarmerProfile.js` - Farmer account profile

### Layer 3 (AI Quality)
- `CropQuality.js` - AI grading results
- `PricePrediction.js` - Market price predictions

### Layer 4 (Transactions)
- `Request.js` - Purchase requests
- `PurchaseOrder.js` - Orders
- `BuyerProfile.js` - Buyer account profile

### Layer 5 (Transport)
- `Transport.js` - Delivery tracking

### Layer 6 (IoT Storage)
- `StorageReading.js` - Sensor data
- `StorageAlert.js` - Storage alerts

### Layer 7 (Communication)
- `Message.js` - Direct messages
- `Notification.js` - System notifications

### Layer 8 (System)
- `ApiLog.js` - API call logging
- `Analytics.js` - System analytics

---

## 📝 **Implementation Checklist**

- [x] User & Access Layer
- [x] Farmer Asset Layer
- [ ] AI Quality & Intelligence Layer (CropQuality, PricePrediction)
- [x] Transaction & Request Layer
- [x] Transport & Delivery Layer
- [ ] IoT Storage Monitoring Layer (StorageReading, StorageAlert)
- [x] Communication & Notification Layer (Message, needs Notification)
- [ ] System & Analytics Layer (ApiLog, Analytics)

---

## 🔗 **API Route Organization**

Routes follow the layer structure:

- `/auth` - User registration/login (Layer 1)
- `/crops` - Crop management (Layer 2)
- `/quality` - AI quality analysis (Layer 3)
- `/requests` - Purchase requests (Layer 4)
- `/orders` - Order management (Layer 4)
- `/transport` - Transport tracking (Layer 5)
- `/storage` - IoT monitoring (Layer 6)
- `/messages` - Direct messaging (Layer 7)
- `/notifications` - Notifications (Layer 7)
- `/admin` - Admin logs/analytics (Layer 8)

---

## 🚀 **Next Steps**

1. ✅ Implement missing models (CropQuality, PricePrediction, StorageReading, StorageAlert, Notification, ApiLog, Analytics)
2. ✅ Add corresponding routes for new models
3. ✅ Integrate middleware for logging (Layer 8)
4. ✅ Add webhooks for real-time storage alerts
5. ✅ Create admin dashboard for Layer 8

---

**Last Updated:** February 5, 2026
**Architecture Version:** 2.0 (Layered Structure)
**Status:** Ready for implementation
