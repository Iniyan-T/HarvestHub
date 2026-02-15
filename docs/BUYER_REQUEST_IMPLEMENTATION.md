# Buyer-Farmer Request Flow - Implementation Summary

## Overview
Complete end-to-end buyer request functionality has been implemented. Buyers can now send crop purchase requests to farmers with quantity and offer price details, and farmers can view, accept, or deny these requests.

---

## Architecture

### 1. **Backend Components**

#### Request Model (`backend/models/Request.js`)
New MongoDB schema for storing buyer requests:
- `farmerId`: ID of the farmer receiving the request
- `buyerId`: ID of the buyer sending the request
- `buyerName`: Name of the buyer
- `buyerContact`: Contact number of the buyer
- `cropName`: Name of the crop requested
- `requestedQuantity`: Quantity in quintals
- `offerPrice`: Price offered per quintal
- `totalAmount`: Calculated total (quantity × offerPrice)
- `status`: One of ['pending', 'accepted', 'denied', 'completed']
- `notes`: Additional notes from buyer
- `createdAt` & `updatedAt`: Timestamps

#### API Endpoints (`backend/server.js`)

**POST /api/requests**
- Creates a new buyer request
- Saves to MongoDB
- Validates required fields
- Response includes full request object with database ID

**GET /api/requests/farmer/:farmerId**
- Retrieves all requests for a specific farmer
- Sorted by newest first
- Returns array of request objects with count

**GET /api/requests/buyer/:buyerId**
- Retrieves all requests sent by a specific buyer
- Useful for buyer tracking their requests

**PUT /api/requests/:requestId**
- Updates request status (accept/deny/complete)
- Supports adding notes during update
- Returns updated request object

**DELETE /api/requests/:requestId**
- Deletes a request from database

---

### 2. **Buyer Frontend Components**

#### CropDetail.tsx (`Buyers/src/components/CropDetail.tsx`)
**Changes:**
- Replaced static `alert()` with modal form
- Form collects: buyer name, contact, quantity, offer price
- Displays total amount calculation in real-time
- Sends POST request to backend with all details
- Shows success/error messages
- Farmers list updated to trigger request modal

**Flow:**
1. Buyer views crops by type (Wheat, Rice, etc.)
2. Clicks "SEND REQ" button next to farmer
3. Modal opens with request form
4. Enters details and submits
5. Backend saves request and sends confirmation

#### FarmerDetail.tsx (`Buyers/src/components/FarmerDetail.tsx`)
**Changes:**
- Similar modal-based request form
- Pre-populated with crop name from farmer's listing
- Sends POST request to backend
- Shows success/error feedback
- "SEND" button on each crop triggers request form

---

### 3. **Farmer Frontend Components**

#### StockRequest.tsx (`Farmer/src/app/components/StockRequest.tsx`)
**Major Refactor:**
- **From:** Mock data with static requests
- **To:** Real-time data from backend API

**Features:**
- Fetches requests on component mount via `GET /api/requests/farmer/:farmerId`
- Loading state while fetching
- Error handling with retry button
- Displays all buyer request details:
  - Buyer name & contact
  - Crop name, quantity, offer price
  - Total amount
  - Request date
  - Notes from buyer
- Action buttons:
  - **Chat**: Opens communication channel (placeholder for future implementation)
  - **Accept**: Changes status to 'accepted' via PUT request
  - **Deny**: Changes status to 'denied' via PUT request
  - Status badges show current state

**UI Improvements:**
- Responsive table layout
- Clear visual hierarchy
- Status indicators (color-coded)
- Loading/error states
- Timestamp display

---

## Data Flow

### Buyer Sends Request
```
Buyer UI (CropDetail/FarmerDetail)
  ↓
Form with: buyerName, contact, cropName, quantity, offerPrice
  ↓
POST /api/requests (with farmerId, buyerId, etc.)
  ↓
Backend validates & creates Request document in MongoDB
  ↓
Response with: _id, totalAmount, status='pending'
  ↓
UI shows success message
```

### Farmer Views Request
```
Farmer App loads StockRequest component
  ↓
useEffect triggers GET /api/requests/farmer/:farmerId
  ↓
Backend queries MongoDB for all requests for that farmer
  ↓
Returns array of request documents sorted by newest first
  ↓
Component displays requests with all details
```

### Farmer Accepts/Denies Request
```
Farmer clicks "Accept" or "Deny" button
  ↓
PUT /api/requests/:requestId with new status
  ↓
Backend updates status in MongoDB
  ↓
Component updates UI to show new status badge
```

---

## API Usage Examples

### Create Request
```bash
POST http://localhost:5000/api/requests
Content-Type: application/json

{
  "farmerId": "507f1f77bcf86cd799439011",
  "buyerId": "buyer_001",
  "buyerName": "Rajesh Gupta",
  "buyerContact": "+91 98765 43210",
  "cropName": "Wheat",
  "requestedQuantity": 50,
  "offerPrice": 2400,
  "notes": "High-quality wheat needed"
}
```

### Get Farmer's Requests
```bash
GET http://localhost:5000/api/requests/farmer/507f1f77bcf86cd799439011
```

### Update Request Status
```bash
PUT http://localhost:5000/api/requests/[REQUEST_ID]
Content-Type: application/json

{
  "status": "accepted",
  "notes": "We can fulfill this order"
}
```

---

## Testing

### Automated Test Suite
Run: `node backend/test-buyer-request-flow.js`

Tests included:
1. ✅ Buyer sends request
2. ✅ Farmer views all requests
3. ✅ Farmer accepts request
4. ✅ Farmer denies request

### Manual Testing Steps

**Step 1: Start Backend**
```bash
cd backend
npm install  # if needed
node server.js
```

**Step 2: Start Buyers App**
```bash
cd Buyers
npm run dev
```

**Step 3: Start Farmer App**
```bash
cd Farmer
npm run dev
```

**Step 4: Send Request from Buyers**
- Navigate to Buyers dashboard
- Click on a crop category (e.g., "Wheat")
- Click "SEND REQ" on any farmer
- Fill out form: name, contact, quantity (50), offer price (2400)
- Click "Send Request"
- Verify success message

**Step 5: View Request in Farmer App**
- Navigate to Farmer's "Stock Request" section
- You should see the request from Step 4
- Verify all details are correct:
  - Buyer name & contact
  - Crop name & quantity
  - Offer price
  - Total amount

**Step 6: Accept/Deny Request**
- Click "Accept" or "Deny" button
- Verify status changes and button disappears
- Refresh to confirm persistence

---

## Database Schema

```javascript
Request {
  _id: ObjectId,
  farmerId: String (indexed),
  buyerId: String,
  buyerName: String,
  buyerContact: String,
  cropId: ObjectId (optional, can reference Crop model in future),
  cropName: String,
  requestedQuantity: Number,
  offerPrice: Number,
  totalAmount: Number,
  status: String enum ['pending', 'accepted', 'denied', 'completed'],
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Production Considerations

1. **Authentication**: Currently using static IDs. Integrate with actual user authentication.
2. **Notifications**: Add real-time notifications when requests are sent/responded to.
3. **Chat Integration**: Implement actual chat feature (currently placeholder).
4. **Validation**: Add more robust input validation on both frontend and backend.
5. **Rate Limiting**: Implement to prevent request spam.
6. **Request History**: Add ability to filter/search requests.
7. **Transactions**: Track completed sales and generate invoices.

---

## Files Modified/Created

### Backend
- ✅ `backend/models/Request.js` - **NEW**
- ✅ `backend/server.js` - Modified (added imports and 5 new endpoints)
- ✅ `backend/test-buyer-request-flow.js` - **NEW** (testing script)

### Buyers Frontend
- ✅ `Buyers/src/components/CropDetail.tsx` - Modified
- ✅ `Buyers/src/components/FarmerDetail.tsx` - Modified

### Farmer Frontend
- ✅ `Farmer/src/app/components/StockRequest.tsx` - Modified

---

## Status: ✅ COMPLETE & READY FOR TESTING

All components are implemented and integrated. The end-to-end flow is functional and ready for testing.
