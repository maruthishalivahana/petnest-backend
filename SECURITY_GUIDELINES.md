# 🔐 Security Guidelines for PetNest Backend

## Overview
This document outlines security best practices implemented in the PetNest backend to prevent unauthorized access to user data.

---

## 🚨 Critical Security Principles

### 1. **NEVER Trust Client-Side User IDs**
❌ **WRONG** - Accepting userId from frontend:
```typescript
// BAD: User can manipulate URL to access other users' data
app.get('/wishlist/:userId', (req, res) => {
    const userId = req.params.userId; // ❌ VULNERABLE!
    const wishlist = await getWishlist(userId);
    res.json(wishlist);
});
```

✅ **CORRECT** - Using JWT token:
```typescript
// GOOD: User ID comes from verified JWT token
app.get('/wishlist', verifyToken, (req, res) => {
    const userId = req.user.id; // ✅ SECURE!
    const wishlist = await getWishlist(userId);
    res.json(wishlist);
});
```

### 2. **JWT Token as Single Source of Truth**
- **ALWAYS** extract user identity from `req.user.id` (set by JWT middleware)
- **NEVER** accept user IDs from:
  - URL parameters (`req.params.userId`)
  - Query strings (`req.query.userId`)
  - Request body (`req.body.userId`)
  - Request headers (except Authorization token)

---

## 🛡️ Implementation Guide

### JWT Authentication Middleware
Located: `src/shared/middlewares/auth.middleware.ts`

```typescript
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(403).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        req.user = decoded; // Sets req.user.id and req.user.role
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};
```

### Role-Based Access Control
```typescript
export const requireRole = (roles: ("buyer" | "seller" | "admin")[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied" });
        }
        next();
    };
};
```

---

## 📋 Secure Route Patterns

### User Profile Routes

#### ✅ **Correct Implementation**
```typescript
// Get logged-in user's profile
buyerRouter.get(
    '/profile',
    verifyToken,
    requireRole(['buyer']),
    getBuyerProfileByIdController
);

// Controller
export const getBuyerProfileByIdController = async (req: Request, res: Response) => {
    const buyerId = req.user?.id; // From JWT token
    
    if (!buyerId) {
        return res.status(403).json({ message: "Access denied" });
    }
    
    const user = await buyerService.getBuyerProfileById(buyerId);
    return res.status(200).json({ user });
};
```

#### ❌ **Vulnerable Pattern (Fixed)**
```typescript
// DON'T DO THIS - allows access to any user's profile
buyerRouter.get('/profile/:buyerId', ...); // ❌ VULNERABLE
```

---

### Wishlist Routes

#### ✅ **Current Secure Implementation**
```typescript
// Fetch wishlist - SECURE
buyerRouter.get(
    '/wishlist',
    verifyToken,
    requireRole(['buyer']),
    getWishlistController
);

export const getWishlistController = async (req: Request, res: Response) => {
    const buyerId = req.user?.id; // From JWT ✅
    if (!buyerId) {
        return res.status(403).json({ message: "Access denied" });
    }
    const wishlist = await buyerService.getWishlist(buyerId);
    return res.status(200).json({ wishlist });
};

// Add to wishlist - SECURE
buyerRouter.post(
    '/wishlist/:petId',
    verifyToken,
    requireRole(['buyer']),
    addToWishlistController
);

export const addToWishlistController = async (req: Request, res: Response) => {
    const buyerId = req.user?.id; // From JWT ✅
    const { petId } = req.params; // Pet ID is OK to accept
    
    if (!buyerId) {
        return res.status(403).json({ message: "Access denied" });
    }
    
    const result = await buyerService.addToWishlist(buyerId, petId);
    return res.status(200).json({ wishlistItem: result });
};

// Remove from wishlist - SECURE
buyerRouter.delete(
    '/wishlist/:petId',
    verifyToken,
    requireRole(['buyer']),
    removefromWishlistController
);

export const removefromWishlistController = async (req: Request, res: Response) => {
    const buyerId = req.user?.id; // From JWT ✅
    const petId = req.params.petId;
    
    if (!buyerId) {
        return res.status(403).json({ message: "Access denied" });
    }
    
    await buyerService.removeFromWishlist(buyerId, petId);
    return res.status(200).json({ message: "Removed successfully" });
};
```

---

### Pet Management Routes (Sellers)

#### ✅ **Secure Seller Operations**
```typescript
// Add pet - seller can only add to their own account
sellerRouter.post(
    "/pet",
    verifyToken,
    requireRole(["seller"]),
    uploadPet.array('images', 3),
    addPetController
);

export const addPetController = async (req: Request, res: Response) => {
    const userId = req.user?.id; // From JWT ✅
    
    if (!userId) {
        return res.status(403).json({ message: "Access denied" });
    }
    
    const newPet = await petService.addPet({ ...petData, userId });
    return res.status(201).json({ pet: newPet });
};

// Get pets - seller only sees their own pets
sellerRouter.get(
    "/pets",
    verifyToken,
    requireRole(["seller"]),
    getPetsBySellerController
);

export const getPetsBySellerController = async (req: Request, res: Response) => {
    const userId = req.user?.id; // From JWT ✅
    
    if (!userId) {
        return res.status(403).json({ message: "Access denied" });
    }
    
    const pets = await petService.getPetsBySeller(userId);
    return res.status(200).json({ data: pets });
};

// Delete pet - verify ownership before deletion
sellerRouter.delete(
    "/pet/:petId",
    verifyToken,
    requireRole(["seller"]),
    deletePetController
);

export const deletePetController = async (req: Request, res: Response) => {
    const userId = req.user?.id; // From JWT ✅
    const { petId } = req.params;
    
    if (!userId) {
        return res.status(403).json({ message: "Access denied" });
    }
    
    // Service layer should verify the pet belongs to this seller
    const deletedPet = await petService.deletePet(petId, userId);
    return res.status(200).json({ message: "Pet deleted successfully" });
};
```

---

## 🔍 Resource Ownership Verification

### Pattern 1: Verify in Service Layer
```typescript
// buyer.service.ts
async getWishlist(buyerId: string) {
    const wishlist = await buyerRepo.getWishList(buyerId);
    
    if (!wishlist || wishlist.length === 0) {
        throw new Error("Wishlist not found");
    }
    
    // Verify ownership (extra security layer)
    const firstBuyerId = (wishlist[0] as any).buyerId;
    if (firstBuyerId && String(firstBuyerId) !== buyerId) {
        throw new Error("Access denied");
    }
    
    return wishlist;
}
```

### Pattern 2: MongoDB Query with User Filter
```typescript
// pet.service.ts
async getPetsBySeller(sellerId: string) {
    // Query automatically filters by seller ID
    const pets = await Pet.find({ 
        seller: sellerId, 
        isDeleted: false 
    });
    return pets;
}

async deletePet(petId: string, sellerId: string) {
    // Find pet AND verify ownership in single query
    const pet = await Pet.findOne({ 
        _id: petId, 
        seller: sellerId, // ✅ Ownership verification
        isDeleted: false 
    });
    
    if (!pet) {
        throw new Error("Pet not found or access denied");
    }
    
    pet.isDeleted = true;
    await pet.save();
    return pet;
}
```

---

## 🛠️ Using Ownership Verification Middleware

Use the helper middleware for resource-specific ownership checks:

```typescript
import { verifyResourceOwnership } from '@shared/middlewares/ownership.middleware';

// Example: Update pet - verify ownership
sellerRouter.patch(
    "/pet/:petId",
    verifyToken,
    requireRole(["seller"]),
    verifyResourceOwnership('Pet', 'petId', 'seller'),
    UpdatePetController
);
```

---

## ⚠️ Common Pitfalls to Avoid

### 1. **Accepting User ID in Request Body**
```typescript
// ❌ BAD
app.post('/wishlist', (req, res) => {
    const { userId, petId } = req.body; // User can fake userId
    await addToWishlist(userId, petId);
});

// ✅ GOOD
app.post('/wishlist/:petId', verifyToken, (req, res) => {
    const userId = req.user.id; // From verified token
    const { petId } = req.params;
    await addToWishlist(userId, petId);
});
```

### 2. **Insufficient Authorization Checks**
```typescript
// ❌ BAD - Only checks if user is authenticated
app.delete('/pet/:petId', verifyToken, async (req, res) => {
    await Pet.findByIdAndDelete(req.params.petId); // Any authenticated user can delete any pet!
});

// ✅ GOOD - Verifies ownership
app.delete('/pet/:petId', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const pet = await Pet.findOne({ _id: req.params.petId, seller: userId });
    
    if (!pet) {
        return res.status(404).json({ message: "Pet not found or access denied" });
    }
    
    await pet.remove();
});
```

### 3. **Not Validating Role-Resource Relationship**
```typescript
// ❌ BAD - Seller accessing buyer-only resources
app.get('/wishlist', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const wishlist = await getWishlist(userId); // Seller could access this!
});

// ✅ GOOD - Role-based access control
app.get('/wishlist', verifyToken, requireRole(['buyer']), async (req, res) => {
    const userId = req.user.id;
    const wishlist = await getWishlist(userId);
});
```

---

## 🔐 JWT Token Validation Process

### Token Flow
1. **Login**: User authenticates → Server generates JWT → Token sent to client
2. **Request**: Client sends token in cookie or Authorization header
3. **Verification**: `verifyToken` middleware validates token signature
4. **Authorization**: `requireRole` middleware checks user permissions
5. **Access**: Controller uses `req.user.id` for data operations

### Token Structure
```json
{
  "id": "507f1f77bcf86cd799439011",
  "role": "buyer",
  "iat": 1701936000,
  "exp": 1701939600
}
```

### Environment Setup
```env
# .env
JWT_SECRET=your-super-secure-secret-key-min-32-chars
JWT_EXPIRES_IN=1h
NODE_ENV=production
```

---

## 📊 Security Checklist

Before deploying or reviewing routes, ensure:

- [ ] All user-specific routes use `verifyToken` middleware
- [ ] Controllers extract user ID from `req.user.id` (not params/body)
- [ ] Role-based access control via `requireRole` middleware
- [ ] Service layer verifies resource ownership before operations
- [ ] MongoDB queries filter by authenticated user's ID
- [ ] Error messages don't leak sensitive information
- [ ] JWT_SECRET is strong and stored securely
- [ ] Token expiration is configured appropriately
- [ ] HTTPS is used in production
- [ ] Rate limiting is implemented on authentication endpoints

---

## 🧪 Testing Security

### Manual Testing
```bash
# Test 1: Try to access another user's wishlist (should fail)
curl -X GET http://localhost:3000/api/buyer/wishlist \
  -H "Authorization: Bearer <USER_A_TOKEN>"

# Test 2: Try to delete another user's pet (should fail)
curl -X DELETE http://localhost:3000/api/seller/pet/<USER_B_PET_ID> \
  -H "Authorization: Bearer <USER_A_TOKEN>"

# Test 3: Access without token (should fail)
curl -X GET http://localhost:3000/api/buyer/profile
```

### Automated Testing Example
```typescript
describe('Authorization Security', () => {
    it('should not allow buyer A to access buyer B profile', async () => {
        const response = await request(app)
            .get('/api/buyer/profile')
            .set('Authorization', `Bearer ${buyerAToken}`);
        
        expect(response.status).toBe(200);
        expect(response.body.user._id).toBe(buyerAId);
        expect(response.body.user._id).not.toBe(buyerBId);
    });
    
    it('should not allow seller to delete another seller\'s pet', async () => {
        const response = await request(app)
            .delete(`/api/seller/pet/${sellerBPetId}`)
            .set('Authorization', `Bearer ${sellerAToken}`);
        
        expect(response.status).toBe(404); // Not found or access denied
    });
});
```

---

## 🚀 Quick Reference

### Secure Controller Template
```typescript
export const secureController = async (req: Request, res: Response) => {
    try {
        // 1. Get user ID from JWT token
        const userId = req.user?.id;
        
        // 2. Validate authentication
        if (!userId) {
            return res.status(403).json({ message: "Access denied" });
        }
        
        // 3. Validate request parameters (but NOT user ID)
        const { resourceId } = req.params;
        if (!resourceId) {
            return res.status(400).json({ message: "Resource ID required" });
        }
        
        // 4. Perform operation with user ID from token
        const result = await service.performOperation(userId, resourceId);
        
        // 5. Return success response
        return res.status(200).json({ 
            message: "Success", 
            data: result 
        });
        
    } catch (error) {
        const errorMessage = (error as Error).message;
        
        // Handle specific errors
        if (errorMessage === "Access denied") {
            return res.status(403).json({ message: errorMessage });
        }
        
        if (errorMessage.includes("not found")) {
            return res.status(404).json({ message: errorMessage });
        }
        
        // Generic error
        return res.status(500).json({ 
            message: "Internal server error",
            ...(process.env.NODE_ENV === 'development' && { error: errorMessage })
        });
    }
};
```

---

## 📚 Additional Resources

- [OWASP Top 10 Security Risks](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)

---

## 📞 Security Contact

If you discover a security vulnerability, please email: security@petnest.com

**DO NOT** open public GitHub issues for security vulnerabilities.

---

*Last Updated: December 7, 2025*
*Version: 1.0.0*
