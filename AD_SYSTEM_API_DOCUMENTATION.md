# Advertisement System API Documentation

A complete advertisement system backend with public advertiser requests, admin-controlled ad management, placement-based ad fetching, feed integration, and tracking.

## Base URL
```
http://localhost:3000/api
```

---

## 1. Public Advertiser Request Flow

### Submit Ad Request (No Auth Required)
```
POST /api/ad-requests
```

**Request Body:**
```json
{
  "brandName": "Pet Store Inc",
  "contactEmail": "advertise@petstore.com",
  "contactNumber": "+1234567890",
  "requestedPlacement": "home_top_banner",
  "message": "We would like to advertise our premium pet food",
  "mediaUrl": "https://example.com/sample-ad.jpg"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Ad request submitted successfully",
  "data": {
    "_id": "...",
    "brandName": "Pet Store Inc",
    "contactEmail": "advertise@petstore.com",
    "status": "pending",
    "createdAt": "2026-01-09T...",
    ...
  }
}
```

---

## 2. Admin - Ad Request Management

### Get All Ad Requests
```
GET /api/admin/ad-requests?status=pending&page=1&limit=10
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `status` (optional): pending | approved | rejected
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "brandName": "Pet Store Inc",
      "contactEmail": "advertise@petstore.com",
      "status": "pending",
      "requestedPlacement": "home_top_banner",
      ...
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

### Update Ad Request Status
```
PATCH /api/admin/ad-requests/:id/status
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body (Approve):**
```json
{
  "status": "approved"
}
```

**Request Body (Reject):**
```json
{
  "status": "rejected",
  "rejectionReason": "Does not meet our advertising guidelines"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Ad request approved successfully",
  "data": {
    "_id": "...",
    "status": "approved",
    ...
  }
}
```

---

## 3. Admin - Ad Management

### Create Ad
```
POST /api/admin/ads
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "title": "Premium Pet Food Sale",
  "imageUrl": "https://cdn.example.com/ad-banner.jpg",
  "ctaText": "Shop Now",
  "redirectUrl": "https://petstore.com/sale",
  "placement": "home_top_banner",
  "device": "both",
  "targetPages": ["/", "/pets"],
  "startDate": "2026-01-10T00:00:00Z",
  "endDate": "2026-02-10T23:59:59Z"
}
```

**Placement Options:**
- `home_top_banner`
- `home_sidebar`
- `home_footer`
- `pet_feed_inline`
- `pet_mobile_sticky`
- `pet_detail_below_desc`
- `pet_detail_sidebar`
- `blog_mid_article`
- `blog_sidebar`
- `dashboard_header`

**Device Options:**
- `mobile`
- `desktop`
- `both` (default)

**Response (201):**
```json
{
  "success": true,
  "message": "Ad created successfully",
  "data": {
    "_id": "...",
    "title": "Premium Pet Food Sale",
    "imageUrl": "https://cdn.example.com/ad-banner.jpg",
    "isActive": true,
    "impressions": 0,
    "clicks": 0,
    ...
  }
}
```

### Get All Ads (Admin)
```
GET /api/admin/ads?placement=home_top_banner&device=mobile&isActive=true&page=1&limit=10
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `placement` (optional): Filter by placement
- `device` (optional): mobile | desktop | both
- `isActive` (optional): true | false
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Premium Pet Food Sale",
      "placement": "home_top_banner",
      "impressions": 1523,
      "clicks": 87,
      "isActive": true,
      ...
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

### Get Ad by ID
```
GET /api/admin/ads/:id
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "Premium Pet Food Sale",
    "imageUrl": "https://cdn.example.com/ad-banner.jpg",
    "ctaText": "Shop Now",
    "redirectUrl": "https://petstore.com/sale",
    "placement": "home_top_banner",
    "device": "both",
    "targetPages": ["/", "/pets"],
    "startDate": "2026-01-10T00:00:00.000Z",
    "endDate": "2026-02-10T23:59:59.000Z",
    "impressions": 1523,
    "clicks": 87,
    "isActive": true,
    "createdAt": "2026-01-09T...",
    "updatedAt": "2026-01-09T..."
  }
}
```

### Update Ad
```
PATCH /api/admin/ads/:id
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body (Partial Update):**
```json
{
  "title": "Updated Title",
  "ctaText": "Buy Now",
  "endDate": "2026-03-10T23:59:59Z"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Ad updated successfully",
  "data": {
    "_id": "...",
    "title": "Updated Title",
    ...
  }
}
```

### Delete Ad
```
DELETE /api/admin/ads/:id
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Ad deleted successfully"
}
```

### Toggle Ad Status
```
PATCH /api/admin/ads/:id/toggle
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Ad activated successfully",
  "data": {
    "_id": "...",
    "isActive": true,
    ...
  }
}
```

---

## 4. Public - Placement-Based Ad Fetching

### Get Ads by Placement
```
GET /api/ads?placement=home_top_banner&device=mobile
```

**Query Parameters:**
- `placement` (required): Ad placement location
- `device` (optional): mobile | desktop | both

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Premium Pet Food Sale",
      "imageUrl": "https://cdn.example.com/ad-banner.jpg",
      "ctaText": "Shop Now",
      "redirectUrl": "https://petstore.com/sale",
      "placement": "home_top_banner",
      "device": "both"
    }
  ]
}
```

**Notes:**
- Only returns active ads
- Automatically filters by date range (startDate ≤ now ≤ endDate)
- Filters by device compatibility

---

## 5. Feed API with Inline Ads

### Get Feed with Inline Ads
```
GET /api/feed?page=1&limit=12&device=mobile
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `device` (optional): mobile | desktop | both
- `species` (optional): Filter pets by species
- `breed` (optional): Filter pets by breed

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "type": "pet",
      "data": {
        "_id": "...",
        "name": "Golden Retriever Puppy",
        "breed": "Golden Retriever",
        "price": 1200,
        "images": ["..."],
        ...
      }
    },
    {
      "type": "pet",
      "data": { ... }
    },
    {
      "type": "pet",
      "data": { ... }
    },
    {
      "type": "pet",
      "data": { ... }
    },
    {
      "type": "ad",
      "data": {
        "_id": "...",
        "title": "Premium Pet Food Sale",
        "imageUrl": "https://cdn.example.com/ad-banner.jpg",
        "ctaText": "Shop Now",
        "redirectUrl": "https://petstore.com/sale",
        "placement": "pet_feed_inline"
      }
    },
    {
      "type": "pet",
      "data": { ... }
    },
    ...
  ],
  "pagination": {
    "total": 120,
    "page": 1,
    "limit": 12,
    "totalPages": 10
  }
}
```

**Inline Ad Logic:**
- 1 ad inserted after every 4 pet cards
- Cycles through available `pet_feed_inline` ads
- Only shows active ads within date range
- Filters by device if specified

---

## 6. Tracking System

### Track Impression
```
POST /api/ads/:id/impression
```

**Response (200):**
```json
{
  "success": true,
  "message": "Impression tracked"
}
```

**When to call:**
- When ad is rendered/visible on screen
- Use Intersection Observer API on frontend

### Track Click
```
POST /api/ads/:id/click
```

**Response (200):**
```json
{
  "success": true,
  "message": "Click tracked"
}
```

**When to call:**
- When user clicks on ad
- Before redirecting to `redirectUrl`

---

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    },
    {
      "field": "endDate",
      "message": "End date must be after start date"
    }
  ]
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Ad not found"
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Invalid token"
}
```

### Forbidden (403)
```json
{
  "success": false,
  "message": "Access denied"
}
```

### Internal Server Error (500)
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Frontend Integration Examples

### Display Ad with Tracking

```javascript
// Fetch ad
const response = await fetch('/api/ads?placement=home_top_banner&device=mobile');
const { data } = await response.json();
const ad = data[0];

// Track impression when visible
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      fetch(`/api/ads/${ad._id}/impression`, { method: 'POST' });
      observer.disconnect();
    }
  });
});
observer.observe(adElement);

// Track click
adElement.addEventListener('click', () => {
  fetch(`/api/ads/${ad._id}/click`, { method: 'POST' });
  window.location.href = ad.redirectUrl;
});
```

### Feed with Inline Ads

```javascript
const response = await fetch('/api/feed?page=1&limit=12&device=mobile');
const { data } = await response.json();

data.forEach(item => {
  if (item.type === 'pet') {
    renderPetCard(item.data);
  } else if (item.type === 'ad') {
    renderAdCard(item.data);
  }
});
```

---

## Database Models

### AdRequest Model
```typescript
{
  brandName: string;
  contactEmail: string;
  contactNumber?: string;
  requestedPlacement: string;
  message?: string;
  mediaUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Ad Model
```typescript
{
  title: string;
  imageUrl: string;
  ctaText: string;
  redirectUrl: string;
  placement: AdPlacement;
  device: 'mobile' | 'desktop' | 'both';
  targetPages: string[];
  startDate: Date;
  endDate: Date;
  impressions: number;
  clicks: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Testing the API

### 1. Submit an ad request (public)
```bash
curl -X POST http://localhost:3000/api/ad-requests \
  -H "Content-Type: application/json" \
  -d '{
    "brandName": "Pet Store Inc",
    "contactEmail": "ads@petstore.com",
    "requestedPlacement": "home_top_banner"
  }'
```

### 2. Admin: Get pending requests
```bash
curl -X GET "http://localhost:3000/api/admin/ad-requests?status=pending" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 3. Admin: Create an ad
```bash
curl -X POST http://localhost:3000/api/admin/ads \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Premium Pet Food",
    "imageUrl": "https://example.com/ad.jpg",
    "ctaText": "Shop Now",
    "redirectUrl": "https://petstore.com",
    "placement": "home_top_banner",
    "startDate": "2026-01-10T00:00:00Z",
    "endDate": "2026-02-10T23:59:59Z"
  }'
```

### 4. Get ads by placement (public)
```bash
curl -X GET "http://localhost:3000/api/ads?placement=home_top_banner"
```

### 5. Get feed with inline ads (public)
```bash
curl -X GET "http://localhost:3000/api/feed?page=1&limit=12"
```

---

## Notes

- All admin routes require authentication with admin role
- Public routes (ad fetching, tracking, feed) work without authentication
- Date validation ensures endDate > startDate
- Ad visibility is automatically controlled by startDate, endDate, and isActive
- Impressions and clicks are incremented atomically to prevent race conditions
- Feed API inserts 1 ad after every 4 pet cards
- Device filtering supports mobile, desktop, or both
