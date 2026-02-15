# Data Migration Guide - User ID Linking Enhancement

**Date:** February 6, 2026  
**Migration Type:** Model Schema Update  
**Impact:** Crop and Request collections  
**Status:** ✅ Complete

## Overview

This guide explains the migration from String-based user IDs to ObjectId references in the Crop and Request models, ensuring proper referential integrity and data consistency across the HarvestHub platform.

## What Changed

### Before (String Type)
```javascript
// Crop Model
{
  farmerId: String  // "507f1f77bcf86cd799439011"
}

// Request Model
{
  farmerId: String,  // "507f1f77bcf86cd799439011"
  buyerId: String    // "507f191e810c19729de860ea"
}
```

### After (ObjectId Type)
```javascript
// Crop Model
{
  farmerId: ObjectId("507f1f77bcf86cd799439011"),
  ref: 'User'
}

// Request Model
{
  farmerId: ObjectId("507f1f77bcf86cd799439011"),
  buyerId: ObjectId("507f191e810c19729de860ea"),
  ref: 'User'
}
```

## Why This Change?

### Benefits

1. **Referential Integrity**
   - MongoDB validates ObjectId references
   - Prevents invalid user IDs
   - Ensures data consistency

2. **Population Support**
   - `.populate()` automatically loads user details
   - Reduces API calls
   - Improves performance

3. **Query Optimization**
   - Indexed ObjectId fields
   - Faster lookups
   - Better query performance

4. **Data Consistency**
   - Consistent with other models (Message, Transaction, PurchaseOrder)
   - Unified data model
   - Easier maintenance

5. **Type Safety**
   - MongoDB enforces ObjectId type
   - Prevents string/ObjectId confusion
   - Clearer data contracts

## Migration Steps

### For Fresh Installations

No migration needed! The new schema will be used automatically.

### For Existing Data

If you have existing crops or requests in your database, follow these steps:

#### Step 1: Backup Your Data

```bash
# Backup MongoDB database
mongodump --uri="mongodb://localhost:27017/harvestHub" --out="./backup-$(date +%Y%m%d)"
```

#### Step 2: Check Existing Data

```javascript
// Connect to MongoDB
mongosh

// Switch to database
use harvestHub

// Check Crop collection
db.crops.findOne()
// Example output:
// {
//   _id: ObjectId("..."),
//   farmerId: "507f1f77bcf86cd799439011",  // String type
//   cropName: "wheat"
// }

// Check Request collection  
db.requests.findOne()
// Example output:
// {
//   _id: ObjectId("..."),
//   farmerId: "507f1f77bcf86cd799439011",  // String type
//   buyerId: "507f191e810c19729de860ea"    // String type
// }
```

#### Step 3: Convert String IDs to ObjectIds

**Option A: Using MongoDB Shell**

```javascript
// Connect to MongoDB
mongosh

// Switch to database
use harvestHub

// Convert Crop collection
db.crops.find({ farmerId: { $type: "string" } }).forEach(function(doc) {
  db.crops.updateOne(
    { _id: doc._id },
    { $set: { farmerId: ObjectId(doc.farmerId) } }
  );
});

// Verify conversion
db.crops.findOne()
// farmerId should now be ObjectId type

// Convert Request collection - farmerId
db.requests.find({ farmerId: { $type: "string" } }).forEach(function(doc) {
  db.requests.updateOne(
    { _id: doc._id },
    {
 $set: {
        farmerId: ObjectId(doc.farmerId),
        buyerId: ObjectId(doc.buyerId)
      }
    }
  );
});

// Verify conversion
db.requests.findOne()
// farmerId and buyerId should now be ObjectId type
```

**Option B: Using Node.js Migration Script**

Create a file `migrate-user-ids.js`:

```javascript
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/harvestHub';

// Connect to MongoDB
await mongoose.connect(MONGODB_URI);

console.log('✅ Connected to MongoDB');

// Get collections
const db = mongoose.connection.db;
const cropsCollection = db.collection('crops');
const requestsCollection = db.collection('requests');

// Migrate Crops
console.log('\n📦 Migrating Crops collection...');
const cropsToMigrate = await cropsCollection.find({ 
  farmerId: { $type: 'string' } 
}).toArray();

console.log(`Found ${cropsToMigrate.length} crops to migrate`);

for (const crop of cropsToMigrate) {
  try {
    await cropsCollection.updateOne(
      { _id: crop._id },
      { $set: { farmerId: new mongoose.Types.ObjectId(crop.farmerId) } }
    );
    console.log(`✅ Migrated crop ${crop._id}`);
  } catch (error) {
    console.error(`❌ Error migrating crop ${crop._id}:`, error.message);
  }
}

// Migrate Requests
console.log('\n📋 Migrating Requests collection...');
const requestsToMigrate = await requestsCollection.find({
  $or: [
    { farmerId: { $type: 'string' } },
    { buyerId: { $type: 'string' } }
  ]
}).toArray();

console.log(`Found ${requestsToMigrate.length} requests to migrate`);

for (const request of requestsToMigrate) {
  try {
    await requestsCollection.updateOne(
      { _id: request._id },
      {
        $set: {
          farmerId: new mongoose.Types.ObjectId(request.farmerId),
          buyerId: new mongoose.Types.ObjectId(request.buyerId)
        }
      }
    );
    console.log(`✅ Migrated request ${request._id}`);
  } catch (error) {
    console.error(`❌ Error migrating request ${request._id}:`, error.message);
  }
}

console.log('\n✅ Migration complete!');
await mongoose.disconnect();
```

Run the migration:

```bash
cd backend
node migrate-user-ids.js
```

#### Step 4: Verify Migration

```javascript
// Check data types
db.crops.findOne()
// farmerId should be ObjectId("...")

db.requests.findOne()
// farmerId and buyerId should be ObjectId("...")

// Test population
db.crops.aggregate([
  { $lookup: {
      from: "users",
      localField: "farmerId",
      foreignField: "_id",
      as: "farmer"
    }
  },
  { $limit: 1 }
])
// Should return crop with populated farmer details
```

## Updated API Responses

### Before Migration

```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "farmerId": "507f1f77bcf86cd799439011",
    "cropName": "wheat",
    "quantity": 1000
  }
}
```

### After Migration

```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "farmerId": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Farmer",
      "email": "john@example.com",
      "phone": "+1234567890",
      "address": {
        "city": "Springfield",
        "state": "IL"
      }
    },
    "cropName": "wheat",
    "quantity": 1000
  }
}
```

## Frontend Adjustments

### Before (Accessing String ID)

```javascript
// Get farmer ID
const farmerId = crop.farmerId;  // String

// Display farmer name (requires separate API call)
const farmerResponse = await fetch(`/api/farmers/${farmerId}`);
const farmer = await farmerResponse.json();
console.log(farmer.name);
```

### After (Accessing Populated Object)

```javascript
// Get farmer ID
const farmerId = crop.farmerId._id;  // ObjectId (if populated)
// OR
const farmerId = crop.farmerId;  // If not populated

// Display farmer name (no additional API call needed)
if (typeof crop.farmerId === 'object') {
  // Populated
  console.log(crop.farmerId.name);
} else {
  // Not populated, fetch separately
  const farmerResponse = await fetch(`/api/farmers/${crop.farmerId}`);
  const farmer = await farmerResponse.json();
  console.log(farmer.name);
}
```

### Recommended Frontend Pattern

```javascript
// Helper function to get user ID
const getUserId = (userRef) => {
  if (typeof userRef === 'object' && userRef !== null) {
    return userRef._id;  // Populated ObjectId
  }
  return userRef;  // Just the ID
};

// Helper function to get user details
const getUserDetails = (userRef) => {
  if (typeof userRef === 'object' && userRef !== null) {
    return userRef;  // Populated user object
  }
  return null;  // Need to fetch
};

// Usage
const farmerId = getUserId(crop.farmerId);
const farmerDetails = getUserDetails(crop.farmerId);

if (farmerDetails) {
  console.log(`Farmer: ${farmerDetails.name}`);
} else {
  // Fetch farmer details
  const response = await fetch(`/api/farmers/${farmerId}`);
  const farmer = await response.json();
  console.log(`Farmer: ${farmer.name}`);
}
```

## Testing After Migration

### 1. Test Crop Creation

```bash
curl -X POST http://localhost:5000/api/crops/analyze \
  -H "Authorization: Bearer YOUR_FARMER_TOKEN" \
  -F "image=@crop.jpg" \
  -F "cropType=wheat" \
  -F "quantity=100" \
  -F "price=25"
```

Expected: Crop created with `farmerId` as ObjectId

### 2. Test Crop Retrieval

```bash
curl http://localhost:5000/api/crops
```

Expected: Crops with populated farmer information

### 3. Test Request Creation

```bash
curl -X POST http://localhost:5000/api/requests \
  -H "Authorization: Bearer YOUR_BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "farmerId": "507f1f77bcf86cd799439011",
    "cropName": "wheat",
    "requestedQuantity": 50,
    "offerPrice": 24
  }'
```

Expected: Request created with both IDs as ObjectId

### 4. Test Request Retrieval

```bash
curl http://localhost:5000/api/requests/buyer/my-requests \
  -H "Authorization: Bearer YOUR_BUYER_TOKEN"
```

Expected: Requests with populated buyer and farmer information

## Rollback Plan

If issues arise, you can rollback:

### Step 1: Restore Backup

```bash
mongorestore --uri="mongodb://localhost:27017/harvestHub" ./backup-20260206
```

### Step 2: Revert Code Changes

```bash
git checkout <previous-commit-hash>
```

### Step 3: Restart Backend

```bash
cd backend
npm start
```

## Common Issues & Solutions

### Issue 1: "Cast to ObjectId failed"

**Symptom:** Error when querying with invalid ID

**Cause:** Frontend sending non-ObjectId string

**Solution:** Validate ObjectId format in frontend
```javascript
const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

if (!isValidObjectId(farmerId)) {
  console.error('Invalid farmer ID');
  return;
}
```

### Issue 2: "User not found"

**Symptom:** Request creation fails with 404

**Cause:** farmerId doesn't exist in User collection

**Solution:** Verify user exists before creating relationships
```javascript
// Backend already validates, but frontend can pre-check
const response = await fetch(`/api/farmers/${farmerId}`);
if (!response.ok) {
  console.error('Farmer not found');
  return;
}
```

### Issue 3: Unpopulated References

**Symptom:** Getting ObjectId instead of user details

**Cause:** API endpoint not populating reference

**Solution:** Update API endpoint to populate
```javascript
// Add .populate() to query
const crops = await Crop.find()
  .populate('farmerId', 'name email phone');
```

## Performance Considerations

### Indexing

Ensure indexes are created for ObjectId fields:

```javascript
// MongoDB shell
db.crops.createIndex({ farmerId: 1 })
db.requests.createIndex({ farmerId: 1 })
db.requests.createIndex({ buyerId: 1 })
```

### Population Strategy

- **Always populate** for detail views
- **Conditionally populate** for list views based on need
- **Select fields** to minimize data transfer

```javascript
// Minimal population for lists
.populate('farmerId', 'name')

// Full population for details
.populate('farmerId', 'name email phone address profileImage')
```

## Monitoring

After migration, monitor:

1. **API Response Times**
   - Should improve with indexed ObjectIds
   - Population adds slight overhead

2. **Error Rates**
   - Watch for "Cast to ObjectId failed" errors
   - Indicates frontend sending invalid IDs

3. **Database Performance**
   - Query execution times
   - Index usage statistics

## Related Documentation

- [User ID Linking System](USER_ID_LINKING_SYSTEM.md)
- [API Documentation](../backend/API_DOCUMENTATION.md)
- [Database Architecture](../backend/DATABASE_ARCHITECTURE.md)

## Support

For migration issues:
- Check MongoDB logs: `C:\data\db\mongod.log`
- Check backend logs: Console output
- Restore backup if critical issues arise

---

**Migration Completed:** February 6, 2026  
**Tested By:** HarvestHub Development Team  
**Status:** ✅ Production Ready
