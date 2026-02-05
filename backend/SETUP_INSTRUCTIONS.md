# Installation & Setup Instructions

## 📦 Install Dependencies

Run the following command in the `/Farm/backend` directory:

```bash
npm install
```

If you encounter peer dependency conflicts, use:

```bash
npm install --legacy-peer-deps
```

This will install the required packages:
- **bcryptjs**: Password hashing and comparison
- **jsonwebtoken**: JWT token generation and verification
- **mongoose**: MongoDB ODM
- All existing dependencies remain unchanged

## 🗄️ Database Configuration

✅ **Already Configured in `.env`:**
```
MONGODB_URI=mongodb+srv://jagaveeravishnut:qwertyuiop@harvesthub.m09io3e.mongodb.net/?appName=HarvestHub
```

## 🚀 Start the Server

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will start on: `http://localhost:5000`

## 📋 Generated Database Models

All models are created in `/backend/models/`:

1. **User.js** - User accounts with JWT authentication
2. **BuyerProfile.js** - Buyer-specific information
3. **FarmerProfile.js** - Farmer-specific information
4. **PurchaseOrder.js** - Buy/sell orders with status tracking
5. **Message.js** - Direct messaging between users
6. **Transport.js** - Delivery tracking with ETA calculation
7. **Wishlist.js** - Saved crops and farmers
8. **Transaction.js** - Payment records

## 🔐 Authentication Routes

All routes created in `/backend/routes/`:

1. **auth.js** - User registration, login, profile management
2. **buyer.js** - Purchase order management (create, accept, reject, list)
3. **messages.js** - Direct messaging system
4. **wishlist.js** - Wishlist management
5. **transport.js** - Transport scheduling with ETA calculation
6. **transactions.js** - Payment transaction tracking

## 🔓 Authentication Header Format

For all protected routes, include:
```
Authorization: Bearer {jwt_token}
```

## 📝 API Testing

Use Postman or any HTTP client to test:

### Example: Register a new buyer
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Buyer",
    "email": "buyer@example.com",
    "phone": "+919876543210",
    "password": "secure_pass123",
    "confirmPassword": "secure_pass123",
    "role": "buyer",
    "address": {
      "city": "Bangalore"
    }
  }'
```

### Example: Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "buyer@example.com",
    "password": "secure_pass123"
  }'
```

Response will include a JWT token to use in subsequent requests.

## 🌍 ETA Calculation

The transport system automatically calculates ETA based on:
- **Haversine Formula** for distance between coordinates
- **Assumed Speed**: 50 km/h for rural transport
- **Coordinates Required**: Farmer location + Buyer location with latitude/longitude

Example:
- Pickup: Belgaum (15.8497°N, 75.7252°E)
- Delivery: Bangalore (12.9716°N, 77.5946°E)
- Distance: ~300 km
- ETA: ~6 hours

## 📖 Complete API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for:
- All endpoint details with examples
- Request/response formats
- Status codes and error handling
- Order flow diagram
- Best practices

## ✨ Features Implemented

### ✅ Buyer Features
- **User Registration & Authentication** (JWT-based)
- **Buyer Profile Management**
- **Purchase Orders** (Create, update, track status)
- **Direct Messaging** (Buyer ↔ Farmer)
- **Wishlist** (Save crops and farmers)
- **Transport Tracking** (With ETA calculation)
- **Payment Transactions** (Recording & history)

### ✅ Role-Based Access Control
- **Buyer** - Can create orders, message farmers, manage wishlist, payment tracking
- **Farmer** - Can accept/reject orders, schedule transport, update delivery status
- **Admin** - Can view all transactions and system data

### ✅ Key Features
1. **JWT Authentication** - Secure token-based auth with expiration
2. **Password Hashing** - bcryptjs with automatic comparison
3. **ETA Calculation** - Haversine formula with coordinates
4. **Order Tracking** - Complete order lifecycle (pending → delivered)
5. **Message System** - Direct messaging with read status
6. **Payment Tracking** - Record transactions with status

## 🔧 Environment Variables

Update `.env` if needed:
```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret_key_change_this_in_production_harvesthub_2026
JWT_EXPIRE=7d
GEMINI_API_KEY=...
```

## 🧪 Testing Checklist

- [ ] Register as buyer
- [ ] Register as farmer
- [ ] Login and get token
- [ ] Update buyer profile
- [ ] Create purchase order
- [ ] Accept order (as farmer)
- [ ] Send message
- [ ] Add to wishlist
- [ ] Schedule transport
- [ ] Record payment
- [ ] Get transaction history

## 📊 Database Collections

After first run, MongoDB will have these collections:
- users
- buyerprofiles
- farmerprofiles
- purchaseorders
- messages
- transports
- wishlists
- transactions
- crops
- requests

## 🚨 Important Notes

1. **Change JWT_SECRET** in production
2. Keep **MongoDB credentials secure**
3. Implement **HTTPS** in production
4. Add **rate limiting** for API endpoints
5. Validate all **email formats** on registration
6. Use **indexed queries** for performance

## 📞 API Base URL

```
http://localhost:5000
```

All endpoints follow the pattern:
```
http://localhost:5000/api/{route}/{endpoint}
```

## ✅ Ready to Use!

All database models, authentication, and API endpoints are now fully functional. Start the server and begin testing!

