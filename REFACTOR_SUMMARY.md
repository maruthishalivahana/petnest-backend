# 🎯 Buyer/Seller Dual-Mode Architecture Refactoring

## Executive Summary

Successfully refactored the dual-mode buyer/seller implementation to follow a **clean, scalable architecture** with a **single source of truth** for seller data. This eliminates data duplication and inconsistency issues.

---

## 📊 Architecture Changes

### BEFORE (Duplicated Data)
```
User Model
├── role: "buyer" | "seller" | "admin"
├── isSellerModeEnabled: boolean
└── sellerInfo: {
    ├── verificationStatus
    ├── documents[]
    ├── whatsappNumber
    └── analytics { views, clicks, messages }
}

Seller Model (SellerRequests)
├── userId
├── brandName
├── documents { idProof, certificate, shopImage }
├── status: "pending" | "verified" | "rejected"
└── analytics { totalViews, wishlistSaves, avgRating }
```
**Problem:** Seller data exists in TWO places, causing sync issues and confusion.

### AFTER (Single Source of Truth)
```
User Model
├── role: "buyer" | "admin"  ✅ Seller is now a capability
├── isSellerModeEnabled: boolean
└── sellerId: ObjectId  ✅ Reference to Seller document

Seller Model (SellerRequests)
├── userId: ObjectId (UNIQUE)  ✅ One seller per user
├── brandName
├── logoUrl
├── bio
├── whatsappNumber
├── location { city, state, pincode }
├── documents { idProof, certificate, shopImage }
├── status: "pending" | "verified" | "rejected" | "suspended"
├── verificationNotes
├── verificationDate
└── analytics { totalViews, wishlistSaves, avgRating }
```
**Solution:** Seller data lives ONLY in Seller model. User just references it.

---

## 🔧 Technical Changes

### 1. User Model ([user.model.ts](src/database/models/user.model.ts))

**Removed:**
- `role: "seller"` (seller is now a capability, not a role)
- `sellerInfo` nested object (all seller data moved to Seller model)

**Added:**
- `sellerId: ObjectId` (reference to Seller document)

**Kept:**
- `isSellerModeEnabled: boolean` (indicates if user has seller capabilities)

```typescript
// ✅ Clean User Interface
interface IUser {
  role: "buyer" | "admin";  // No more "seller" role
  isSellerModeEnabled: boolean;
  sellerId?: ObjectId;  // Reference to Seller
  // ... other user fields
}
```

---

### 2. Seller Model ([seller.model.ts](src/database/models/seller.model.ts))

**Updated:**
- `userId` now has `unique: true` constraint
- Ensures one seller profile per user at database level

```typescript
userId: {
  type: Schema.Types.ObjectId,
  ref: "User",
  required: true,
  unique: true,  // ✅ Enforces one seller per user
  index: true
}
```

---

### 3. Authentication & Authorization

#### Auth Service ([auth.service.ts](src/modules/auth/auth.service.ts))

**Added:**
- `getUserByIdWithSeller()` - Fetches user with populated seller data

**Updated `/me` endpoint** to return structured response:
```typescript
{
  user: {
    id, name, email, role,
    isSellerModeEnabled,
    sellerId,
    // ... other user fields
  },
  seller: {  // Only if isSellerModeEnabled === true
    brandName,
    status,
    analytics,
    // ... other seller fields
  }
}
```

#### Validation ([auth.validation.ts](src/validations/auth.validation.ts))

**Updated:**
- Signup schema now only accepts `role: "buyer" | "admin"`
- Users register as buyers, then enable seller mode separately

---

### 4. Middleware ([auth.middleware.ts](src/shared/middlewares/auth.middleware.ts))

**Added:**
- `requireSellerMode` - Checks if `isSellerModeEnabled === true` and `sellerId` exists
- `requireSellerVerified` - Checks if seller status is `"verified"` in Seller model

**Updated:**
- `requireRole` now only accepts `["buyer", "admin"]`

**Usage:**
```typescript
// Old way ❌
requireRole(["seller"])

// New way ✅
requireSellerMode  // For any seller operation
requireSellerVerified  // For verified sellers only
```

---

### 5. Seller Service ([seller.service.ts](src/modules/seller/seller.service.ts))

**Updated:**
- `createSellerRequest()` now:
  1. Creates Seller document
  2. Links it to User via `linkSellerToUser()`
  3. Sets `isSellerModeEnabled = true` and stores `sellerId`

**Removed:**
- All old dual-mode methods that operated on `User.sellerInfo`

---

### 6. Type Definitions

**Updated files:**
- [express/index.d.ts](src/shared/types/express/index.d.ts) - Removed "seller" role
- [user.types.ts](src/modules/user/user.types.ts) - `UserRole = "buyer" | "admin"`
- [user.service.ts](src/modules/user/user.service.ts) - Updated `getUsersByRole()`
- [user.repo.ts](src/modules/user/user.repo.ts) - Updated `findUsersByRole()`
- [user.controller.ts](src/modules/user/user.controller.ts) - Role validation updated

---

## 🎨 Frontend Integration Guide

### How to Consume the New API

#### 1. Check Seller Status
```typescript
// Call /me endpoint
const response = await fetch('/auth/me');
const { user, seller } = response.data;

// Show buyer UI (always visible)
renderBuyerUI(user);

// Show seller UI only if enabled
if (user.isSellerModeEnabled) {
  if (seller.status === 'verified') {
    renderSellerDashboard(seller);
  } else if (seller.status === 'pending') {
    renderPendingVerification();
  } else if (seller.status === 'rejected') {
    renderRejectionMessage(seller.verificationNotes);
  }
}
```

#### 2. Enable Seller Mode
```typescript
// User wants to become a seller
const response = await fetch('/seller/request', {
  method: 'POST',
  body: formDataWithDocuments
});
// This will:
// - Create Seller document
// - Set user.isSellerModeEnabled = true
// - Link via user.sellerId
```

#### 3. UI State Management
```typescript
// Frontend state structure
interface AppState {
  user: {
    role: 'buyer' | 'admin';
    isSellerModeEnabled: boolean;
    sellerId: string | null;
  };
  seller?: {
    status: 'pending' | 'verified' | 'rejected' | 'suspended';
    brandName: string;
    analytics: { ... };
  };
}

// UI rendering logic
const shouldShowBuyerUI = true; // Always
const shouldShowSellerMenu = user.isSellerModeEnabled;
const shouldShowSellerDashboard = seller?.status === 'verified';
const shouldShowVerificationPending = seller?.status === 'pending';
```

---

## 🔄 Migration Notes

### Database Migration (If Needed)

If you have existing users with `sellerInfo` in User documents:

```javascript
// Migration script (run once)
const users = await User.find({ isSellerModeEnabled: true });

for (const user of users) {
  if (user.sellerInfo && !user.sellerId) {
    // Check if Seller document exists
    let seller = await Seller.findOne({ userId: user._id });
    
    if (!seller) {
      // Migrate sellerInfo to Seller document
      seller = await Seller.create({
        userId: user._id,
        status: user.sellerInfo.verificationStatus || 'pending',
        documents: user.sellerInfo.documents || {},
        whatsappNumber: user.sellerInfo.whatsappNumber,
        // ... map other fields
      });
    }
    
    // Link seller to user
    user.sellerId = seller._id;
    user.sellerInfo = undefined;  // Remove old field
    await user.save();
  }
}
```

### Backward Compatibility

✅ **Existing seller requests** continue to work
✅ **Pet management** endpoints unchanged (only middleware updated)
✅ **Admin verification** workflow preserved

---

## 🚀 Benefits of New Architecture

### 1. Data Integrity
- ✅ One seller per user enforced at database level (`unique: true`)
- ✅ No more sync issues between User and Seller data
- ✅ Single source of truth for all seller information

### 2. Scalability
- ✅ Easy to add new seller fields without touching User model
- ✅ Seller analytics and business logic isolated
- ✅ Clear separation of concerns

### 3. Performance
- ✅ Efficient queries with indexed `userId` in Seller model
- ✅ Populate seller data only when needed
- ✅ Smaller User documents (no nested sellerInfo)

### 4. Maintainability
- ✅ Clear data ownership
- ✅ Easier to test and debug
- ✅ Reduced code duplication

---

## 📝 API Endpoints Summary

### Seller Endpoints

| Endpoint | Method | Middleware | Purpose |
|----------|--------|------------|---------|
| `/seller/request` | POST | `verifyToken` | Create/update seller request |
| `/seller/pet` | POST | `requireSellerVerified` | Add new pet listing |
| `/seller/pets` | GET | `requireSellerVerified` | Get all seller pets |
| `/seller/pet/:petId` | PATCH | `requireSellerVerified` | Update pet |
| `/seller/pet/:petId` | DELETE | `requireSellerVerified` | Delete pet |

### Auth Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/signup` | POST | Register as buyer (role: "buyer" or "admin") |
| `/auth/login` | POST | Login (returns user + seller if enabled) |
| `/auth/me` | GET | Get current user with populated seller data |

---

## 🧪 Testing Checklist

- [x] User signup with role "buyer" works
- [x] User cannot signup with role "seller" (validation error)
- [x] `/me` endpoint returns user + seller when `isSellerModeEnabled === true`
- [x] Seller request creates Seller document and links via `sellerId`
- [x] `requireSellerMode` middleware blocks non-sellers
- [x] `requireSellerVerified` middleware blocks unverified sellers
- [x] Pet operations require verified seller status
- [x] Admin can verify/reject seller requests
- [x] No `sellerInfo` field in User responses

---

## 📚 Files Changed

### Models
- ✅ [src/database/models/user.model.ts](src/database/models/user.model.ts)
- ✅ [src/database/models/seller.model.ts](src/database/models/seller.model.ts)

### Services & Repositories
- ✅ [src/modules/auth/auth.service.ts](src/modules/auth/auth.service.ts)
- ✅ [src/modules/auth/auth.repo.ts](src/modules/auth/auth.repo.ts)
- ✅ [src/modules/seller/seller.service.ts](src/modules/seller/seller.service.ts)
- ✅ [src/modules/seller/seller.repo.ts](src/modules/seller/seller.repo.ts)

### Controllers
- ✅ [src/modules/auth/auth.controller.ts](src/modules/auth/auth.controller.ts)
- ✅ [src/modules/seller/seller.controller.ts](src/modules/seller/seller.controller.ts)
- ✅ [src/modules/user/user.controller.ts](src/modules/user/user.controller.ts)

### Middleware
- ✅ [src/shared/middlewares/auth.middleware.ts](src/shared/middlewares/auth.middleware.ts)

### Routes
- ✅ [src/routes/seller.routes.ts](src/routes/seller.routes.ts)

### Validations & Types
- ✅ [src/validations/auth.validation.ts](src/validations/auth.validation.ts)
- ✅ [src/modules/user/user.types.ts](src/modules/user/user.types.ts)
- ✅ [src/shared/types/express/index.d.ts](src/shared/types/express/index.d.ts)

---

## 🎓 Key Takeaways

1. **Seller is a capability, not a role**
   - Users register as "buyer" or "admin"
   - They enable seller mode separately

2. **Single source of truth**
   - All seller data lives in Seller model
   - User model only references it via `sellerId`

3. **Clean separation**
   - User: Identity and authentication
   - Seller: Business profile and verification

4. **Referential integrity**
   - `userId` in Seller is unique
   - One user can have only one seller profile

5. **Frontend-friendly**
   - `/me` endpoint returns structured data
   - Clear flags for UI rendering logic

---

## 🆘 Support & Migration Assistance

If you encounter issues during migration:

1. **Check existing data**: Run a query to see how many users have `sellerInfo`
2. **Test migration script**: Try on a small subset first
3. **Backup database**: Always backup before running migrations
4. **Monitor logs**: Check for errors during seller request creation

---

## 📅 Refactoring Date

**Completed:** December 16, 2025

**Version:** v2.0.0 (Clean Architecture)

---

**Created by:** GitHub Copilot (Claude Sonnet 4.5)  
**Refactoring Type:** Data Architecture Cleanup
