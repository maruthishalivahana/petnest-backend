# 🚀 Quick Reference Guide - Seller Mode Architecture

## For Backend Developers

### Creating New Seller Endpoints

```typescript
// ✅ DO: Use requireSellerVerified for seller-only operations
sellerRouter.post(
  "/new-feature",
  verifyToken,
  requireSellerVerified,  // Checks isSellerModeEnabled AND seller.status === 'verified'
  yourController
);

// ❌ DON'T: Use old requireRole(["seller"])
sellerRouter.post(
  "/new-feature",
  verifyToken,
  requireRole(["seller"]),  // This will throw error - seller is not a role anymore
  yourController
);
```

### Accessing Seller Data in Controllers

```typescript
// ✅ DO: Fetch seller data from Seller model
export const yourController = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  // Get user with seller populated
  const user = await User.findById(userId).populate('sellerId');
  
  if (!user.sellerId) {
    return res.status(403).json({ message: "Seller profile not found" });
  }
  
  const seller = user.sellerId; // This is the Seller document
  console.log(seller.brandName, seller.status, seller.analytics);
};

// ❌ DON'T: Try to access user.sellerInfo
const sellerInfo = user.sellerInfo; // undefined - this field no longer exists
```

### Creating Seller Profile

```typescript
// When user submits seller request
async createSellerRequest(userData, files) {
  // 1. Create Seller document
  const seller = await Seller.create({
    userId: userData.userId,
    brandName: userData.brandName,
    documents: files,
    status: 'pending'
  });
  
  // 2. Link to User
  await User.findByIdAndUpdate(userData.userId, {
    isSellerModeEnabled: true,
    sellerId: seller._id
  });
  
  return seller;
}
```

### Querying Sellers

```typescript
// ✅ Find all verified sellers
const verifiedSellers = await Seller.find({ status: 'verified' })
  .populate('userId', 'name email profilePic');

// ✅ Find seller by user ID
const seller = await Seller.findOne({ userId: userIdString });

// ✅ Check if user is a seller
const user = await User.findById(userId).select('isSellerModeEnabled sellerId');
if (user.isSellerModeEnabled && user.sellerId) {
  // User has seller capabilities
}
```

---

## For Frontend Developers

### Checking User's Seller Status

```typescript
// Call /auth/me endpoint
interface MeResponse {
  user: {
    id: string;
    role: 'buyer' | 'admin';
    isSellerModeEnabled: boolean;
    sellerId: string | null;
  };
  seller?: {
    brandName: string;
    status: 'pending' | 'verified' | 'rejected' | 'suspended';
    analytics: { ... };
  };
}

const { user, seller } = await api.get('/auth/me');
```

### UI Rendering Logic

```typescript
// 1. Buyer UI - Always show
const showBuyerUI = true;

// 2. Seller Menu - Show if seller mode enabled
const showSellerMenu = user.isSellerModeEnabled;

// 3. Seller Dashboard - Show only if verified
const showSellerDashboard = seller?.status === 'verified';

// 4. Verification Status Banner
if (seller?.status === 'pending') {
  showBanner('Your seller account is pending verification');
} else if (seller?.status === 'rejected') {
  showBanner(`Rejected: ${seller.verificationNotes}`);
}
```

### State Management Example (React)

```typescript
interface UserState {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'buyer' | 'admin';
    isSellerModeEnabled: boolean;
    sellerId: string | null;
  };
  seller?: {
    brandName: string;
    status: string;
    analytics: {
      totalViews: number;
      wishlistSaves: number;
      averageRating: number;
    };
  };
}

// In your component
function App() {
  const { user, seller } = useAuth();
  
  return (
    <>
      <BuyerUI />  {/* Always visible */}
      
      {user.isSellerModeEnabled && (
        <>
          <SellerMenu />
          
          {seller?.status === 'verified' && (
            <SellerDashboard seller={seller} />
          )}
          
          {seller?.status === 'pending' && (
            <VerificationPending />
          )}
          
          {seller?.status === 'rejected' && (
            <RejectionMessage notes={seller.verificationNotes} />
          )}
        </>
      )}
    </>
  );
}
```

### Enabling Seller Mode

```typescript
// User clicks "Become a Seller"
async function applyAsSeller(formData: FormData) {
  try {
    const response = await fetch('/seller/request', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData  // includes idProof, certificate, shopImage
    });
    
    if (response.ok) {
      // Refresh user data to get seller info
      const updatedUser = await fetch('/auth/me');
      // updatedUser.user.isSellerModeEnabled === true
      // updatedUser.seller.status === 'pending'
    }
  } catch (error) {
    console.error('Failed to apply as seller:', error);
  }
}
```

### Accessing Seller Features

```typescript
// Check permissions before showing UI elements
const canAddPet = seller?.status === 'verified';
const canViewAnalytics = user.isSellerModeEnabled && seller;

// API calls
async function addPet(petData) {
  // This will fail if seller not verified (middleware checks it)
  const response = await fetch('/seller/pet', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(petData)
  });
  
  if (response.status === 403) {
    // User is not verified seller
    showError('You must be a verified seller to add pets');
  }
}
```

---

## Common Patterns

### Pattern 1: Check if User Can Sell

```typescript
// Backend
function canUserSell(user: IUser): boolean {
  return user.isSellerModeEnabled && !!user.sellerId;
}

// Frontend
function canUserSell(user: User): boolean {
  return user.isSellerModeEnabled && user.sellerId !== null;
}
```

### Pattern 2: Get Seller With User Info

```typescript
// Backend - Get seller with user details
const seller = await Seller.findById(sellerId)
  .populate('userId', 'name email profilePic phoneNumber');

console.log(seller.userId.name); // User's name
console.log(seller.brandName);   // Seller's brand name
```

### Pattern 3: Seller Status Badge

```typescript
// Frontend component
function SellerStatusBadge({ status }: { status: string }) {
  const statusConfig = {
    pending: { color: 'yellow', text: 'Pending Verification' },
    verified: { color: 'green', text: 'Verified Seller' },
    rejected: { color: 'red', text: 'Verification Rejected' },
    suspended: { color: 'gray', text: 'Account Suspended' }
  };
  
  const { color, text } = statusConfig[status];
  return <Badge color={color}>{text}</Badge>;
}
```

---

## Data Flow Diagrams

### User Registration → Seller Request → Verification

```
1. User Registers
   POST /auth/signup { role: "buyer" }
   ↓
   User created with:
   - role: "buyer"
   - isSellerModeEnabled: false
   - sellerId: null

2. User Applies to Be Seller
   POST /seller/request { brandName, documents... }
   ↓
   Seller created:
   - userId: <user_id>
   - status: "pending"
   ↓
   User updated:
   - isSellerModeEnabled: true
   - sellerId: <seller_id>

3. Admin Verifies
   PATCH /admin/seller/:id { status: "verified" }
   ↓
   Seller updated:
   - status: "verified"

4. User Gets Full Access
   GET /auth/me
   ↓
   Returns:
   {
     user: { isSellerModeEnabled: true, sellerId: "..." },
     seller: { status: "verified", brandName: "..." }
   }
```

---

## Troubleshooting

### Issue: "Seller mode is not enabled"

**Cause:** User doesn't have `isSellerModeEnabled: true` or `sellerId` is null

**Fix:**
```typescript
// Check user document
const user = await User.findById(userId);
console.log(user.isSellerModeEnabled, user.sellerId);

// If false or null, user needs to submit seller request
```

### Issue: "Seller profile not found"

**Cause:** `user.sellerId` doesn't match any Seller document

**Fix:**
```typescript
// Verify seller exists
const seller = await Seller.findById(user.sellerId);
if (!seller) {
  // Orphaned reference - reset user
  await User.updateOne(
    { _id: userId },
    { isSellerModeEnabled: false, sellerId: null }
  );
}
```

### Issue: Can't access seller endpoints

**Cause:** Seller status is not "verified"

**Fix:**
```typescript
const seller = await Seller.findOne({ userId });
console.log(seller.status); // Should be "verified"

// If "pending", wait for admin verification
// If "rejected", user needs to reapply
```

---

## Best Practices

### ✅ DO

- Always populate `sellerId` when you need seller data
- Check both `isSellerModeEnabled` AND `sellerId` existence
- Use `requireSellerVerified` middleware for seller-only routes
- Handle all seller statuses in UI (pending, verified, rejected, suspended)

### ❌ DON'T

- Don't try to access `user.sellerInfo` (it doesn't exist anymore)
- Don't use `requireRole(["seller"])` (seller is not a role)
- Don't create sellers without linking via `sellerId`
- Don't duplicate seller data in User model

---

## API Quick Reference

| Endpoint | Auth | Purpose | Returns |
|----------|------|---------|---------|
| `GET /auth/me` | Token | Get current user + seller | `{ user, seller }` |
| `POST /seller/request` | Token | Apply as seller | `{ sellerRequest }` |
| `POST /seller/pet` | Verified | Add pet | `{ pet }` |
| `GET /seller/pets` | Verified | Get seller pets | `{ pets[] }` |
| `PATCH /admin/seller/:id` | Admin | Verify seller | `{ seller }` |

---

**Last Updated:** December 16, 2025  
**Architecture Version:** v2.0 (Clean Architecture)
