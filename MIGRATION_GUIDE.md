# 🔄 Database Migration Guide

## Overview

This guide helps you migrate existing data from the old dual-mode architecture to the new clean architecture.

---

## ⚠️ Pre-Migration Checklist

- [ ] **Backup your database** before running any migration
- [ ] Test migration on a development/staging environment first
- [ ] Ensure you have MongoDB access with write permissions
- [ ] Review the number of affected users

```javascript
// Check how many users need migration
db.users.count({ isSellerModeEnabled: true })
db.users.count({ "sellerInfo": { $exists: true } })
```

---

## 📊 Migration Strategy

### Option 1: Clean Start (Recommended for Development)

If you're in early development with minimal data:

1. **Drop existing data**
   ```bash
   # Connect to MongoDB
   mongo your_database_name
   
   # Drop collections
   db.users.drop()
   db.sellerrequests.drop()
   ```

2. **Restart with clean schemas**
   - Users will need to re-register
   - Sellers will need to resubmit requests
   - No migration needed

---

### Option 2: Data Migration (Production)

If you have production data that must be preserved:

#### Step 1: Analyze Current Data

```javascript
// MongoDB Shell or Node.js script
const usersWithSellerInfo = await User.find({
  isSellerModeEnabled: true,
  sellerInfo: { $exists: true }
});

console.log(`Found ${usersWithSellerInfo.length} users with seller info`);
```

#### Step 2: Create Migration Script

Save this as `migrate-seller-data.js`:

```javascript
const mongoose = require('mongoose');
const User = require('./src/database/models/user.model').default;
const Seller = require('./src/database/models/seller.model').default;

async function migrateSellerData() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database');

    // Find all users with seller info
    const usersWithSellerInfo = await User.find({
      isSellerModeEnabled: true,
      sellerInfo: { $exists: true }
    });

    console.log(`Found ${usersWithSellerInfo.length} users to migrate`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const user of usersWithSellerInfo) {
      try {
        // Check if Seller document already exists
        let seller = await Seller.findOne({ userId: user._id });

        if (seller) {
          console.log(`Seller already exists for user ${user.email}`);
          skipped++;
        } else {
          // Create new Seller document from User.sellerInfo
          seller = await Seller.create({
            userId: user._id,
            brandName: user.name + "'s Store", // Default brand name
            logoUrl: user.profilePic || '',
            bio: user.bio || '',
            whatsappNumber: user.sellerInfo?.whatsappNumber || user.phoneNumber,
            location: {
              city: user.location || ''
            },
            documents: {
              idProof: user.sellerInfo?.documents?.[0] || '',
              certificate: user.sellerInfo?.documents?.[1] || '',
              shopImage: user.sellerInfo?.documents?.[2] || ''
            },
            status: mapVerificationStatus(user.sellerInfo?.verificationStatus),
            analytics: {
              totalViews: user.sellerInfo?.analytics?.totalViews || 0,
              wishlistSaves: 0,
              averageRating: 0
            }
          });

          console.log(`Created Seller for user ${user.email}`);
        }

        // Update User to reference Seller
        user.sellerId = seller._id;
        // Remove old sellerInfo field
        user.sellerInfo = undefined;
        // Update role if it was "seller"
        if (user.role === 'seller') {
          user.role = 'buyer'; // Set to buyer since seller is now a capability
        }
        
        await user.save();
        migrated++;
        console.log(`✅ Migrated: ${user.email}`);

      } catch (error) {
        console.error(`❌ Error migrating user ${user.email}:`, error.message);
        errors++;
      }
    }

    console.log('\n=== Migration Summary ===');
    console.log(`Total users processed: ${usersWithSellerInfo.length}`);
    console.log(`Successfully migrated: ${migrated}`);
    console.log(`Skipped (already migrated): ${skipped}`);
    console.log(`Errors: ${errors}`);

    await mongoose.disconnect();
    console.log('Disconnected from database');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Helper function to map old verification status to new
function mapVerificationStatus(oldStatus) {
  const statusMap = {
    'pending': 'pending',
    'verified': 'verified',
    'rejected': 'rejected'
  };
  return statusMap[oldStatus] || 'pending';
}

// Run migration
migrateSellerData()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
```

#### Step 3: Run Migration

```bash
# Make sure your .env file is configured
node migrate-seller-data.js
```

#### Step 4: Verify Migration

```javascript
// Verification script
const User = require('./src/database/models/user.model').default;
const Seller = require('./src/database/models/seller.model').default;

async function verifyMigration() {
  // Check for any remaining sellerInfo
  const usersWithOldData = await User.find({
    sellerInfo: { $exists: true }
  });
  
  if (usersWithOldData.length > 0) {
    console.log(`⚠️ Warning: ${usersWithOldData.length} users still have sellerInfo`);
  } else {
    console.log('✅ All sellerInfo removed from User documents');
  }

  // Check if all seller-mode users have sellerId
  const sellerUsers = await User.find({ isSellerModeEnabled: true });
  const usersWithoutSellerId = sellerUsers.filter(u => !u.sellerId);
  
  if (usersWithoutSellerId.length > 0) {
    console.log(`⚠️ Warning: ${usersWithoutSellerId.length} users missing sellerId`);
  } else {
    console.log('✅ All seller-mode users have sellerId');
  }

  // Check if all Seller documents have corresponding Users
  const sellers = await Seller.find();
  for (const seller of sellers) {
    const user = await User.findById(seller.userId);
    if (!user) {
      console.log(`⚠️ Warning: Seller ${seller._id} has no corresponding user`);
    } else if (user.sellerId?.toString() !== seller._id.toString()) {
      console.log(`⚠️ Warning: User ${user.email} sellerId mismatch`);
    }
  }

  console.log('\n=== Verification Complete ===');
}

verifyMigration();
```

---

## 🧪 Testing After Migration

### 1. Test User Login
```bash
# Should return user with seller populated if isSellerModeEnabled === true
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected response:
```json
{
  "message": "Authenticated",
  "user": {
    "id": "...",
    "role": "buyer",
    "isSellerModeEnabled": true,
    "sellerId": "..."
  },
  "seller": {
    "brandName": "...",
    "status": "verified",
    "analytics": { ... }
  }
}
```

### 2. Test Seller Operations
```bash
# Should work for verified sellers
curl -X POST http://localhost:3000/seller/pet \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "images=@pet.jpg"
```

### 3. Check Database Directly
```javascript
// MongoDB Shell
db.users.findOne({ isSellerModeEnabled: true })
// Should NOT have sellerInfo field
// Should have sellerId reference

db.sellerrequests.findOne({ userId: ObjectId("USER_ID") })
// Should have all seller data
```

---

## 🔧 Rollback Plan

If migration fails, you can rollback:

### 1. Restore from Backup
```bash
mongorestore --db your_database_name --drop /path/to/backup
```

### 2. Manual Rollback (if no backup)

```javascript
// Rollback script (use with caution)
const users = await User.find({ sellerId: { $exists: true } });

for (const user of users) {
  const seller = await Seller.findById(user.sellerId);
  
  if (seller) {
    // Restore sellerInfo from Seller document
    user.sellerInfo = {
      verificationStatus: seller.status,
      documents: [
        seller.documents?.idProof,
        seller.documents?.certificate,
        seller.documents?.shopImage
      ].filter(Boolean),
      whatsappNumber: seller.whatsappNumber,
      analytics: {
        totalViews: seller.analytics?.totalViews || 0,
        totalClicks: 0,
        totalMessages: 0
      }
    };
    
    // Remove sellerId
    user.sellerId = undefined;
    
    await user.save();
  }
}
```

---

## 📋 Post-Migration Cleanup

After successful migration and testing:

### 1. Remove Old Fields from Schema
The code already doesn't include `sellerInfo` in the User schema, but you may want to clean up old documents:

```javascript
// Optional: Remove sellerInfo field from all users
db.users.updateMany(
  { sellerInfo: { $exists: true } },
  { $unset: { sellerInfo: "" } }
)
```

### 2. Update Indexes
```javascript
// Ensure unique index on Seller.userId
db.sellerrequests.createIndex({ userId: 1 }, { unique: true })
```

### 3. Update Application Code
- Deploy new codebase with updated models
- Update frontend to consume new API response structure
- Update any cron jobs or background tasks

---

## 🚨 Common Issues

### Issue 1: Duplicate Seller Documents

**Problem:** Multiple Seller documents for the same user

**Solution:**
```javascript
// Find and merge duplicates
const duplicates = await Seller.aggregate([
  { $group: { _id: "$userId", count: { $sum: 1 }, docs: { $push: "$$ROOT" } } },
  { $match: { count: { $gt: 1 } } }
]);

for (const dup of duplicates) {
  // Keep the first one, delete others
  const [keep, ...remove] = dup.docs;
  await Seller.deleteMany({ _id: { $in: remove.map(d => d._id) } });
  
  // Update user to reference the kept one
  await User.updateOne(
    { _id: dup._id },
    { $set: { sellerId: keep._id } }
  );
}
```

### Issue 2: Missing Seller Documents

**Problem:** User has `isSellerModeEnabled: true` but no Seller document

**Solution:**
```javascript
const orphanedUsers = await User.find({
  isSellerModeEnabled: true,
  sellerId: null
});

for (const user of orphanedUsers) {
  // Create placeholder Seller
  const seller = await Seller.create({
    userId: user._id,
    brandName: user.name + "'s Store",
    status: 'pending',
    documents: { idProof: '', certificate: '' }
  });
  
  user.sellerId = seller._id;
  await user.save();
}
```

### Issue 3: Old "seller" Role

**Problem:** Some users still have `role: "seller"`

**Solution:**
```javascript
// Update all seller roles to buyer
await User.updateMany(
  { role: "seller" },
  { $set: { role: "buyer" } }
);
```

---

## 📊 Monitoring

After migration, monitor:

1. **User registrations** - Should only allow "buyer" or "admin"
2. **Seller requests** - Should create Seller docs and link properly
3. **API errors** - Watch for null reference errors on `sellerId`
4. **Database queries** - Ensure indexes are being used

---

## 📞 Support

If you encounter issues:

1. Check logs for error messages
2. Verify data with MongoDB shell queries
3. Test with a single user before bulk migration
4. Keep backup until migration is confirmed successful

---

**Last Updated:** December 16, 2025
