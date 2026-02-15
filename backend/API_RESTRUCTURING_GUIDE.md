# 🔐 API Restructuring - User ID Authentication

## Overview
Successfully restructured all backend APIs to use **authenticated unique user IDs** from JWT tokens instead of accepting IDs in request parameters. This prevents security vulnerabilities and ensures proper authorization.

**Completed:** February 6, 2026

---

## 🎯 Key Changes

### Security Improvements
- ✅ **All common APIs now use `req.user._id`** from authentication middleware
- ✅ **Removed ability to impersonate other users** by passing arbitrary IDs
- ✅ **Added role-based authorization** for sensitive endpoints
- ✅ **Proper ownership validation** for all resources

---

## 📝 Detailed Changes

### 1. **Crop Management APIs** (server.js)

#### POST `/api/crops/analyze` 
**Before:** Accepted `farmerId` in request body  
**After:** Uses `req.user._id` from authenticated farmer

```javascript
// OLD - Security Risk
const { cropType, quantity, price, farmerId } = req.body;
farmerId: farmerId || '507f1f77bcf86cd799439011'

// NEW - Secure
const { cropType, quantity, price } = req.body;
farmerId: req.user._id  // From JWT token
```

**Changes:**
- ✅ Added `authenticate` middleware
- ✅ Added `authorize('farmer')` to ensure only farmers can upload
- ✅ Automatically uses authenticated user's ID

---

#### GET `/api/crops/farmer/my-crops`
**Before:** `GET /api/crops/farmer/:farmerId` - could view any farmer's crops  
**After:** `GET /api/crops/farmer/my-crops` - only views own crops

```javascript
// OLD - Could access any farmer's data
app.get('/api/crops/farmer/:farmerId', async (req, res) => {
  const crops = await Crop.find({ farmerId: req.params.farmerId });
});

// NEW - Secure, authenticated access
app.get('/api/crops/farmer/my-crops', authenticate, authorize('farmer'), async (req, res) => {
  const crops = await Crop.find({ farmerId: req.user._id });
});
```

**Benefits:**
- ✅ Farmers can only see their own crops
- ✅ Prevents unauthorized data access
- ✅ Clearer API endpoint naming

---

### 2. **Request Management APIs** (server.js)

#### POST `/api/requests`
**Before:** Accepted `buyerId`, `buyerName`, `buyerContact` in body  
**After:** Uses authenticated user's information

```javascript
// OLD - Could create requests as any user
const { farmerId, buyerId, buyerName, buyerContact, ... } = req.body;

// NEW - Uses authenticated buyer's info
const { farmerId, cropName, requestedQuantity, ... } = req.body;
buyerId: req.user._id,
buyerName: req.user.name,
buyerContact: req.user.phone || req.user.email
```

**Changes:**
- ✅ Added `authenticate` middleware
- ✅ Added `authorize('buyer')` - only buyers can create requests
- ✅ Auto-fills buyer information from authenticated user
- ✅ **Bonus:** Auto-creates notification for farmer

---

#### GET `/api/requests/farmer/my-requests`
**Before:** `GET /api/requests/farmer/:farmerId`  
**After:** `GET /api/requests/farmer/my-requests`

```javascript
// OLD
app.get('/api/requests/farmer/:farmerId', async (req, res) => {
  const requests = await Request.find({ farmerId: req.params.farmerId });
});

// NEW - Secure
app.get('/api/requests/farmer/my-requests', authenticate, authorize('farmer'), async (req, res) => {
  const requests = await Request.find({ farmerId: req.user._id });
});
```

**Benefits:**
- ✅ Farmers can only see requests sent to them
- ✅ Prevents viewing other farmers' requests

---

#### GET `/api/requests/buyer/my-requests`
**Before:** `GET /api/requests/buyer/:buyerId`  
**After:** `GET /api/requests/buyer/my-requests`

```javascript
// OLD
app.get('/api/requests/buyer/:buyerId', async (req, res) => {
  const requests = await Request.find({ buyerId: req.params.buyerId });
});

// NEW - Secure
app.get('/api/requests/buyer/my-requests', authenticate, authorize('buyer'), async (req, res) => {
  const requests = await Request.find({ buyerId: req.user._id });
});
```

**Benefits:**
- ✅ Buyers can only see their own requests
- ✅ Prevents viewing other buyers' requests

---

#### PUT `/api/requests/:requestId`
**Before:** No authentication or authorization  
**After:** Validates ownership before updating

```javascript
// OLD - Anyone could update any request
app.put('/api/requests/:requestId', async (req, res) => {
  await Request.findByIdAndUpdate(requestId, updateData);
});

// NEW - Secure with ownership validation
app.put('/api/requests/:requestId', authenticate, async (req, res) => {
  const request = await Request.findById(req.params.requestId);
  
  // Check authorization
  if (request.farmerId.toString() !== req.user._id.toString() && 
      request.buyerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  
  // Update and notify
  await request.save();
  await notificationService.notifyBuyerRequestResponse(...);
});
```

**Benefits:**
- ✅ Only involved farmer or buyer can update
- ✅ Auto-notifies buyer when farmer updates status
- ✅ Prevents unauthorized modifications

---

#### DELETE `/api/requests/:requestId`
**Before:** No authentication or authorization  
**After:** Only buyer who created it can delete

```javascript
// OLD - Anyone could delete any request
app.delete('/api/requests/:requestId', async (req, res) => {
  await Request.findByIdAndDelete(requestId);
});

// NEW - Secure
app.delete('/api/requests/:requestId', authenticate, async (req, res) => {
  const request = await Request.findById(req.params.requestId);
  
  // Only buyer who created can delete
  if (request.buyerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  
  await Request.findByIdAndDelete(req.params.requestId);
});
```

---

### 3. **AI Assistant APIs** (server.js)

#### POST `/api/ai-assistant/chat`
**Before:** Accepted `userId` and `userType` in body  
**After:** Uses authenticated user's information

```javascript
// OLD - Could chat as any user
const { message, userId, userType } = req.body;
await aiAssistant.chat(userId, userType, message);

// NEW - Secure
const { message } = req.body;
await aiAssistant.chat(req.user._id.toString(), req.user.role, message);
```

**Benefits:**
- ✅ Chat history tied to authenticated user
- ✅ Prevents impersonation
- ✅ Automatic role detection

---

#### GET `/api/ai-assistant/suggestions`
**Before:** Accepted `userId` and `userType` as query params  
**After:** Uses authenticated user's information

```javascript
// OLD
const { userId, userType } = req.query;
const suggestions = await aiAssistant.getQuickSuggestions(userId, userType);

// NEW
const suggestions = await aiAssistant.getQuickSuggestions(
  req.user._id.toString(), 
  req.user.role
);
```

---

#### POST `/api/ai-assistant/clear-history`
**Before:** Accepted `userId` in body  
**After:** Uses authenticated user's ID

```javascript
// OLD - Could clear anyone's history
const { userId } = req.body;
aiAssistant.clearHistory(userId);

// NEW - Only clears own history
aiAssistant.clearHistory(req.user._id.toString());
```

---

### 4. **Messaging APIs** (routes/messages.js)

#### GET `/conversation/:userId`
**Before:** Didn't consider user roles when creating conversation ID  
**After:** Gets other user's role for proper conversation ID

```javascript
// OLD - Role-agnostic
const conversationId = createConversationId(req.user._id, otherUserId);

// NEW - Role-aware
const otherUser = await User.findById(otherUserId);
const conversationId = createConversationId(
  req.user._id,
  req.user.role,
  otherUserId,
  otherUser.role
);
```

**Benefits:**
- ✅ Consistent conversation IDs (always `buyer:{id}-farmer:{id}`)
- ✅ Proper message threading
- ✅ Better conversation management

---

### 5. **Notification APIs** (routes/notifications.js)

#### POST `/api/notifications`
**Before:** Anyone could create notifications for anyone  
**After:** Admin-only endpoint

```javascript
// OLD - Security risk
router.post('/', authenticate, async (req, res) => {
  const { userId, type, title, message } = req.body;
  await Notification.create({ userId, ... });
});

// NEW - Admin only
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  const { userId, type, title, message } = req.body;
  await Notification.create({ userId, ... });
});
```

**Benefits:**
- ✅ Prevents notification spam
- ✅ Only admins can create arbitrary notifications
- ✅ System notifications use internal service

---

### 6. **New Notification Service** (services/notification.service.js)

Created internal notification service for automated notifications:

```javascript
// Auto-notify farmer when buyer creates request
await notificationService.notifyFarmerNewRequest(
  farmerId,
  requestId,
  buyerName,
  cropName
);

// Auto-notify buyer when farmer responds
await notificationService.notifyBuyerRequestResponse(
  buyerId,
  requestId,
  status,
  farmerName
);
```

**Available Methods:**
- `notifyFarmerNewRequest()` - Buyer created request
- `notifyBuyerRequestResponse()` - Farmer accepted/denied
- `notifyNewMessage()` - New chat message
- `notifyPayment()` - Payment received/processed
- `notifyOrderStatus()` - Order status changed
- `notifyStorageAlert()` - Storage condition alert

**Benefits:**
- ✅ Consistent notification format
- ✅ Automatic notification creation
- ✅ Doesn't fail main operation if notification fails
- ✅ Reusable across different endpoints

---

## 🔄 API Endpoint Changes Summary

| Old Endpoint | New Endpoint | Auth Required | Role Required |
|-------------|--------------|---------------|---------------|
| `POST /api/crops/analyze` | Same | ✅ Yes | farmer |
| `GET /api/crops/farmer/:farmerId` | `GET /api/crops/farmer/my-crops` | ✅ Yes | farmer |
| `POST /api/requests` | Same | ✅ Yes | buyer |
| `GET /api/requests/farmer/:farmerId` | `GET /api/requests/farmer/my-requests` | ✅ Yes | farmer |
| `GET /api/requests/buyer/:buyerId` | `GET /api/requests/buyer/my-requests` | ✅ Yes | buyer |
| `PUT /api/requests/:requestId` | Same | ✅ Yes | buyer or farmer (owner) |
| `DELETE /api/requests/:requestId` | Same | ✅ Yes | buyer (creator) |
| `POST /api/ai-assistant/chat` | Same | ✅ Yes | any |
| `GET /api/ai-assistant/suggestions` | Same | ✅ Yes | any |
| `POST /api/ai-assistant/clear-history` | Same | ✅ Yes | any |
| `GET /api/messages/conversation/:userId` | Same | ✅ Yes | any |
| `POST /api/notifications` | Same | ✅ Yes | **admin only** |

---

## 🚨 Breaking Changes for Frontend

### Required Frontend Updates

#### 1. **Remove User ID from Requests**

**Crop Upload (Farmer Dashboard):**
```javascript
// OLD
const formData = new FormData();
formData.append('farmerId', userId);  // ❌ Remove this
formData.append('cropType', cropType);
formData.append('quantity', quantity);
formData.append('price', price);

// NEW
const formData = new FormData();
// farmerId auto-filled from JWT token
formData.append('cropType', cropType);
formData.append('quantity', quantity);
formData.append('price', price);
```

---

#### 2. **Update API Endpoints**

**Fetch Farmer's Crops:**
```javascript
// OLD
axios.get(`/api/crops/farmer/${farmerId}`)

// NEW
axios.get('/api/crops/farmer/my-crops')
```

**Fetch Farmer's Requests:**
```javascript
// OLD
axios.get(`/api/requests/farmer/${farmerId}`)

// NEW
axios.get('/api/requests/farmer/my-requests')
```

**Fetch Buyer's Requests:**
```javascript
// OLD
axios.get(`/api/requests/buyer/${buyerId}`)

// NEW
axios.get('/api/requests/buyer/my-requests')
```

---

#### 3. **Update Request Creation**

**Create Buyer Request:**
```javascript
// OLD
const requestData = {
  farmerId: farmerIdFromList,
  buyerId: currentBuyerId,        // ❌ Remove
  buyerName: currentUserName,      // ❌ Remove
  buyerContact: currentUserPhone,  // ❌ Remove
  cropName: 'Tomato',
  requestedQuantity: 100,
  offerPrice: 50
};

// NEW
const requestData = {
  farmerId: farmerIdFromList,
  // buyer info auto-filled from JWT token
  cropName: 'Tomato',
  requestedQuantity: 100,
  offerPrice: 50
};
```

---

#### 4. **Update AI Assistant Calls**

**Chat with AI:**
```javascript
// OLD
const chatData = {
  message: userMessage,
  userId: currentUserId,     // ❌ Remove
  userType: 'farmer'         // ❌ Remove
};

// NEW
const chatData = {
  message: userMessage
  // userId and role auto-filled from JWT token
};
```

**Get Suggestions:**
```javascript
// OLD
axios.get('/api/ai-assistant/suggestions', {
  params: { userId: currentUserId, userType: 'buyer' }  // ❌ Remove
})

// NEW
axios.get('/api/ai-assistant/suggestions')
// No params needed - uses authenticated user
```

---

#### 5. **Authorization Headers**

**All API calls must include JWT token:**
```javascript
// Set default Authorization header after login
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Or include in individual requests
axios.get('/api/crops/farmer/my-crops', {
  headers: { Authorization: `Bearer ${token}` }
});
```

---

## 🔒 Security Benefits

### Before Restructuring:
- ❌ Users could view/modify other users' data by changing IDs
- ❌ No authorization checks on sensitive operations
- ❌ Possible impersonation attacks
- ❌ Data leakage through parameter manipulation

### After Restructuring:
- ✅ Users can only access their own data
- ✅ All operations validated against authenticated user
- ✅ Role-based access control enforced
- ✅ Automatic audit trail through JWT tokens
- ✅ Prevents unauthorized notifications
- ✅ Secure conversation threading

---

## 📊 Authorization Matrix

| Resource | Create | Read Own | Read All | Update Own | Update Others | Delete Own | Delete Others |
|----------|--------|----------|----------|------------|---------------|------------|---------------|
| **Crops** | Farmer | Farmer | All | Farmer | ❌ | Farmer | ❌ |
| **Requests** | Buyer | Both\* | ❌ | Both\* | ❌ | Buyer | ❌ |
| **Messages** | Both | Both | ❌ | ❌ | ❌ | Both | ❌ |
| **Notifications** | Admin | User | ❌ | User | ❌ | User | ❌ |
| **Orders** | Buyer | Both\* | ❌ | Both\* | ❌ | Buyer\* | ❌ |

\* Both = Farmer and Buyer involved in the transaction

---

## 🧪 Testing the New APIs

### Test 1: Farmer Crop Upload
```bash
# Login as farmer
POST /api/auth/login
{
  "email": "farmer@example.com",
  "password": "password123"
}
# Save token from response

# Upload crop (no farmerId needed)
POST /api/crops/analyze
Headers: Authorization: Bearer <token>
Body: FormData
  - image: <file>
  - cropType: "Tomato"
  - quantity: "100"
  - price: "50"

# Expected: Success, farmerId auto-filled
```

### Test 2: Buyer Create Request
```bash
# Login as buyer
POST /api/auth/login
{
  "email": "buyer@example.com",
  "password": "password123"
}

# Create request (no buyerId/buyerName needed)
POST /api/requests
Headers: Authorization: Bearer <token>
{
  "farmerId": "673abc123def456...",
  "cropName": "Tomato",
  "requestedQuantity": 50,
  "offerPrice": 45
}

# Expected: Success, buyer info auto-filled, farmer notified
```

### Test 3: View Own Data
```bash
# As farmer
GET /api/crops/farmer/my-crops
Headers: Authorization: Bearer <farmer_token>

# As buyer
GET /api/requests/buyer/my-requests  
Headers: Authorization: Bearer <buyer_token>

# Expected: Only sees own data
```

### Test 4: Authorization Failure
```bash
# Try to create crop as buyer (should fail)
POST /api/crops/analyze
Headers: Authorization: Bearer <buyer_token>
Body: <crop data>

# Expected: 403 Forbidden - "requires farmer role"
```

---

## 🎉 Summary

### What We Achieved:
✅ **100% of common APIs** now use authenticated user IDs  
✅ **Zero hardcoded user IDs** in production code  
✅ **Proper role-based authorization** on all endpoints  
✅ **Automatic notifications** for key user actions  
✅ **Secure conversation threading** with role awareness  
✅ **Admin-only system notifications** prevent abuse  

### Files Modified:
- ✅ `backend/server.js` - 11 endpoints updated
- ✅ `backend/routes/messages.js` - Conversation endpoint fixed
- ✅ `backend/routes/notifications.js` - Admin-only access
- ✅ `backend/services/notification.service.js` - **New file** for system notifications
- ✅ `backend/middleware/auth.js` - Already properly configured

### Next Steps:
1. ✅ Backend restructured and tested
2. ⏳ Update frontend components to use new endpoints
3. ⏳ Remove hardcoded user IDs from frontend
4. ⏳ Update API documentation for frontend team
5. ⏳ Test complete user flows (register → login → use features)

---

**All APIs now properly secured with unique user ID authentication! 🔐**

*Last Updated: February 6, 2026*
