# 🚀 PetNest Backend API Documentation{{baseUrl}}/health



**Base URL:** `{{baseUrl}}`  -- AUTH --

**API Version:** v1  {{baseUrl}}/v1/api/auth/signup            (POST)

**Last Updated:** November 11, 2025{{baseUrl}}/v1/api/auth/verify-otp       (POST)

{{baseUrl}}/v1/api/auth/resend-otp       (POST)

---{{baseUrl}}/v1/api/auth/login             (POST)

{{baseUrl}}/v1/api/auth/logout            (POST)

## 📋 Table of Contents

- [Health Check](#health-check)-- ADMIN (requires admin token) --

- [Authentication](#authentication)# Users

- [Admin APIs](#admin-apis){{baseUrl}}/v1/api/admin/users                          (GET)

  - [User Management](#user-management){{baseUrl}}/v1/api/admin/users/:userId                  (GET)

  - [Seller Verification](#seller-verification){{baseUrl}}/v1/api/admin/users/:userId/ban              (PATCH)

  - [Species Management](#species-management){{baseUrl}}/v1/api/admin/users/:userId/unban            (PATCH)

  - [Breed Management](#breed-management){{baseUrl}}/v1/api/admin/users/role/:role               (GET)

  - [Pet Verification](#pet-verification)

  - [Advertisement Management](#advertisement-management)# Seller verification

- [Seller APIs](#seller-apis){{baseUrl}}/v1/api/admin/seller-requests/pending        (GET)

- [Buyer APIs](#buyer-apis){{baseUrl}}/v1/api/admin/sellers/verified               (GET)

- [Public APIs](#public-apis){{baseUrl}}/v1/api/admin/seller-requests/:id/:status    (PUT)  -- status = approve|reject (example)



---# Species

{{baseUrl}}/v1/api/admin/species                        (GET)

## 🏥 Health Check{{baseUrl}}/v1/api/admin/species                        (POST)

{{baseUrl}}/v1/api/admin/species/:id                    (GET)

| Method | Endpoint | Auth Required | Description |{{baseUrl}}/v1/api/admin/species/:id                    (DELETE)

|--------|----------|---------------|-------------|

| `GET` | `/health` |  No | Check server health status |# Breeds

{{baseUrl}}/v1/api/admin/breeds                         (GET)

---{{baseUrl}}/v1/api/admin/breeds                         (POST)

{{baseUrl}}/v1/api/admin/breeds/:id                     (GET)

##  Authentication{{baseUrl}}/v1/api/admin/breeds/:id                     (DELETE)



**Base Path:** `/v1/api/auth`# Pets (admin verification)

{{baseUrl}}/v1/api/admin/pets/not-verified              (GET)

| Method | Endpoint | Auth Required | Description |{{baseUrl}}/v1/api/admin/pets/:petId/:status            (PATCH) -- status e.g. verified|rejected

|--------|----------|---------------|-------------|

| `POST` | `/signup` |  No | Register a new user account |# Advertisements (admin)

| `POST` | `/verify-otp` |  No | Verify OTP sent to email/phone |{{baseUrl}}/v1/api/admin/advertisements                 (GET)  -- returns advertisement requests

| `POST` | `/resend-otp` |  No | Resend OTP to user |{{baseUrl}}/v1/api/admin/advertisements/requests        (GET)  -- pending requests (alias)

| `POST` | `/login` |  No | User login with credentials |{{baseUrl}}/v1/api/admin/advertisements/listings        (GET)  -- list ad listings (filters: ?status=&adSpot=&skip=&limit=)

| `POST` | `/logout` |  No | Logout current user |{{baseUrl}}/v1/api/admin/advertisements/:adId           (GET)  -- get ad listing by id

{{baseUrl}}/v1/api/admin/advertisements/listing         (POST) -- create ad listing (multipart/form-data, field 'images')

---{{baseUrl}}/v1/api/admin/advertisements/:adId/:status   (PATCH) -- change status (active|paused|inactive|expired|rejected)

{{baseUrl}}/v1/api/admin/advertisements/:adId           (DELETE)

##  Admin APIs

-- SELLER --

**Base Path:** `/v1/api/admin`  {{baseUrl}}/v1/api/seller/request                       (POST) -- seller form request

**Authentication:**  Admin JWT token required (Cookie or Authorization header){{baseUrl}}/v1/api/seller/pet                           (POST)

{{baseUrl}}/v1/api/seller/pets                          (GET)

###  User Management{{baseUrl}}/v1/api/seller/pet/:petId                     (GET)

{{baseUrl}}/v1/api/seller/pet/:petId                     (PATCH)

| Method | Endpoint | Description | Query Params |

|--------|----------|-------------|--------------|-- BUYER --

| `GET` | `/users` | Get all users | - |{{baseUrl}}/v1/api/buyer/profile                        (PATCH)

| `GET` | `/users/:userId` | Get user by ID | - |{{baseUrl}}/v1/api/buyer/profile/:buyerId               (GET)

| `GET` | `/users/role/:role` | Get users by role | role: `buyer`, `seller`, `admin` |{{baseUrl}}/v1/api/buyer/breeds                         (GET)

| `DELETE` | `/users/:userId` | Delete user by ID | - |

| `PATCH` | `/users/:userId/ban` | Ban a user | - |

| `PATCH` | `/users/:userId/unban` | Unban a user | - |# Ad user endpoints (requests)

{{baseUrl}}/v1/api/ads/request/advertisement            (POST) -- request an advertisement (advisement)

###  Seller Verification

Note: For endpoints that accept multipart uploads (ad listing creation), send files under field name 'images' (max 5). For admin endpoints include a valid admin JWT (cookie or Authorization header).

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/seller-requests/pending` | Get all pending seller verification requests |
| `GET` | `/sellers/verified` | Get all verified sellers |
| `PUT` | `/seller-requests/:sellerRequestId/:status` | Approve/reject seller request |

**Status values:** `approve`, `reject`

###  Species Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/species` | Get all species |
| `POST` | `/species` | Create a new species |
| `GET` | `/species/:id` | Get species by ID |
| `DELETE` | `/species/:id` | Delete species by ID |

### 🦴 Breed Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/breeds` | Get all breeds |
| `POST` | `/breeds` | Create a new breed |
| `GET` | `/breeds/:id` | Get breed by ID |
| `DELETE` | `/breeds/:id` | Delete breed by ID |

###  Pet Verification

| Method | Endpoint | Description | Status Values |
|--------|----------|-------------|---------------|
| `GET` | `/pets/not-verified` | Get all unverified pets | - |
| `PATCH` | `/pets/:petId/:status` | Update pet verification status | `verified`, `rejected` |

###  Advertisement Management

#### Advertisement Requests

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| `GET` | `/advertisements` | Get all advertisement requests | - |
| `GET` | `/advertisements/requests` | Get pending advertisement requests | - |
| `GET` | `/advertisements/approved` | Get all approved advertisement requests | - |
| `PATCH` | `/ad/request/:adId/:status` | Update advertisement request status | status: `approve`, `reject` |

#### Advertisement Listings

| Method | Endpoint | Description | Query Params | Content-Type |
|--------|----------|-------------|--------------|--------------|
| `POST` | `/advertisements/listing` | Create new ad listing | - | `multipart/form-data` |
| `GET` | `/advertisements/listings` | Get all ad listings | `status`, `adSpot`, `skip`, `limit` | - |
| `GET` | `/advertisements/:adId` | Get ad listing by ID | - | - |
| `PATCH` | `/advertisements/:adId/status` | Change ad listing status | status (in URL param) | - |
| `DELETE` | `/advertisements/:adId` | Delete ad listing | - | - |

**Ad Status Values:** `active`, `paused`, `inactive`, `expired`, `rejected`  
**Ad Spot Values:** `homepageBanner`, `sidebar`, `footer`, `blogFeature`  
**Upload Field:** `images` (max 5 files)

---

##  Seller APIs

**Base Path:** `/v1/api/seller`  
**Authentication:**  Seller JWT token required

### Seller Verification

| Method | Endpoint | Description | Content-Type | Upload Fields |
|--------|----------|-------------|--------------|---------------|
| `POST` | `/request` | Submit seller verification request | `multipart/form-data` | `idProof`, `certificate`, `shopImage` |

### Pet Management

| Method | Endpoint | Description | Content-Type | Upload Field |
|--------|----------|-------------|--------------|--------------|
| `POST` | `/pet` | Add a new pet | `multipart/form-data` | `images` (max 3) |
| `GET` | `/pets` | Get all pets by seller | - | - |
| `PATCH` | `/pet/:petId` | Update pet by ID | - | - |
| `DELETE` | `/pet/:petId` | Delete pet by ID | - | - |

---

##  Buyer APIs

**Base Path:** `/v1/api/buyer`  
**Authentication:**  Buyer JWT token required

### Profile Management

| Method | Endpoint | Description | Content-Type | Upload Field |
|--------|----------|-------------|--------------|--------------|
| `PATCH` | `/profile` | Update buyer profile | `multipart/form-data` | `profilePic` |
| `GET` | `/profile/:buyerId` | Get buyer profile by ID | - | - |

### Breed Access

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/breeds` | Get all breeds (buyer view) |

### Wishlist Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/wishlist` | Get buyer's wishlist |
| `POST` | `/wishlist/:petId` | Add pet to wishlist |
| `DELETE` | `/wishlist/:petId` | Remove pet from wishlist |

### Pet Browsing

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/pets` | Get all available pets |
| `GET` | `/pets/:petId` | Get pet details by ID |

---

##  Public APIs

**Authentication:**  No authentication required

### Advertisement Listings (Public)

**Base Path:** `/v1/api/ads`

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| `GET` | `/` | Get active ad listings | `status=active`, `adSpot`, `skip`, `limit` |
| `GET` | `/:adId` | Get ad listing by ID (active only) | - |
| `POST` | `/request/advertisement` | Request an advertisement | - |

**Default Behavior:** Returns only `active` ads with `startDate ≤ now` and `endDate > now`

---

##  Notes

### Authentication
- **Admin endpoints:** Require admin role JWT token
- **Seller endpoints:** Require seller role JWT token
- **Buyer endpoints:** Require buyer role JWT token
- **Token can be sent via:**
  - Cookie: `token=<JWT>`
  - Header: `Authorization: Bearer <JWT>`

### File Uploads
- **Content-Type:** `multipart/form-data`
- **Ad Listing Creation:** Field name `images`, max 5 files
- **Pet Creation:** Field name `images`, max 3 files
- **Seller Request:** Fields `idProof`, `certificate`, `shopImage` (1 each)
- **Buyer Profile:** Field name `profilePic`

### Query Parameters
- **Pagination:** `skip` (offset), `limit` (count)
- **Filtering:** `status`, `adSpot`, `role`

### Response Format
```json
{
  "message": "Success message",
  "data": { /* response data */ }
}
```

### Error Response Format
```json
{
  "message": "Error message",
  "error": "Detailed error (development mode only)"
}
```

---

##  Quick Reference

**Environment Variables:**
```
{{baseUrl}} = http://localhost:8080 (development)
<!-- {{baseUrl}} = https://api.petnest.com (production) -->
```

**Example Requests:**

```bash
# Health Check
GET {{baseUrl}}/health

# Login
POST {{baseUrl}}/v1/api/auth/login
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "password123"
}

# Get Active Ads (Public)
GET {{baseUrl}}/v1/api/ads?status=active&adSpot=homepageBanner

# Get All Users (Admin)
GET {{baseUrl}}/v1/api/admin/users
Cookie: token=<admin-jwt>
```

---

**Generated by PetNest Backend**  
**Version:** 1.0.0
