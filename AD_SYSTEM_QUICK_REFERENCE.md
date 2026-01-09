# Advertisement System - Quick Reference

## 🚀 Quick Start Commands

### Test Public Endpoints (No Auth)

```bash
# 1. Submit ad request
curl -X POST http://localhost:3000/api/ad-requests \
  -H "Content-Type: application/json" \
  -d '{
    "brandName": "Pet Paradise",
    "contactEmail": "ads@petparadise.com",
    "requestedPlacement": "home_top_banner"
  }'

# 2. Get ads by placement
curl http://localhost:3000/api/ads?placement=home_top_banner

# 3. Get feed with inline ads
curl http://localhost:3000/api/feed?page=1&limit=12

# 4. Track impression
curl -X POST http://localhost:3000/api/ads/AD_ID_HERE/impression

# 5. Track click
curl -X POST http://localhost:3000/api/ads/AD_ID_HERE/click
```

### Test Admin Endpoints (Auth Required)

```bash
# Replace YOUR_ADMIN_TOKEN with actual token

# 1. Get pending ad requests
curl http://localhost:3000/api/admin/ad-requests?status=pending \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# 2. Approve ad request
curl -X PATCH http://localhost:3000/api/admin/ad-requests/REQUEST_ID/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "approved"}'

# 3. Create ad
curl -X POST http://localhost:3000/api/admin/ads \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Premium Dog Food",
    "imageUrl": "https://example.com/dog-food-ad.jpg",
    "ctaText": "Shop Now",
    "redirectUrl": "https://petstore.com/dog-food",
    "placement": "home_top_banner",
    "startDate": "2026-01-10T00:00:00Z",
    "endDate": "2026-02-10T23:59:59Z"
  }'

# 4. Get all ads
curl http://localhost:3000/api/admin/ads \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# 5. Update ad
curl -X PATCH http://localhost:3000/api/admin/ads/AD_ID/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title"}'

# 6. Toggle ad status
curl -X PATCH http://localhost:3000/api/admin/ads/AD_ID/toggle \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# 7. Delete ad
curl -X DELETE http://localhost:3000/api/admin/ads/AD_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 📍 All Available Placements

```javascript
const placements = [
  'home_top_banner',      // Homepage top
  'home_sidebar',         // Homepage sidebar
  'home_footer',          // Homepage footer
  'pet_feed_inline',      // Between pet cards
  'pet_mobile_sticky',    // Mobile sticky
  'pet_detail_below_desc',// Pet detail page
  'pet_detail_sidebar',   // Pet detail sidebar
  'blog_mid_article',     // Blog mid-article
  'blog_sidebar',         // Blog sidebar
  'dashboard_header'      // Dashboard header
];
```

---

## 🎯 Common Use Cases

### 1. Show ad on homepage banner
```javascript
// Fetch
fetch('/api/ads?placement=home_top_banner&device=desktop')
  .then(r => r.json())
  .then(({ data }) => {
    if (data.length > 0) {
      displayAd(data[0]);
    }
  });

// Display with tracking
function displayAd(ad) {
  const html = `
    <a href="${ad.redirectUrl}" id="ad-${ad._id}">
      <img src="${ad.imageUrl}" alt="${ad.title}" />
      <button>${ad.ctaText}</button>
    </a>
  `;
  
  document.getElementById('banner').innerHTML = html;
  
  // Track impression
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      fetch(`/api/ads/${ad._id}/impression`, { method: 'POST' });
      observer.disconnect();
    }
  });
  observer.observe(document.getElementById(`ad-${ad._id}`));
  
  // Track click
  document.getElementById(`ad-${ad._id}`).addEventListener('click', () => {
    fetch(`/api/ads/${ad._id}/click`, { method: 'POST' });
  });
}
```

### 2. Display feed with inline ads
```javascript
async function loadFeed(page = 1) {
  const response = await fetch(`/api/feed?page=${page}&limit=12&device=mobile`);
  const { data, pagination } = await response.json();
  
  const container = document.getElementById('feed-container');
  
  data.forEach(item => {
    if (item.type === 'pet') {
      container.innerHTML += renderPetCard(item.data);
    } else if (item.type === 'ad') {
      container.innerHTML += renderAdCard(item.data);
    }
  });
}

function renderPetCard(pet) {
  return `
    <div class="pet-card">
      <img src="${pet.images[0]}" />
      <h3>${pet.name}</h3>
      <p>$${pet.price}</p>
    </div>
  `;
}

function renderAdCard(ad) {
  return `
    <div class="ad-card" data-ad-id="${ad._id}">
      <a href="${ad.redirectUrl}">
        <img src="${ad.imageUrl}" />
        <button>${ad.ctaText}</button>
      </a>
    </div>
  `;
}
```

### 3. Admin: Manage ad requests
```javascript
async function getPendingRequests() {
  const response = await fetch('/api/admin/ad-requests?status=pending', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  return await response.json();
}

async function approveRequest(requestId) {
  const response = await fetch(`/api/admin/ad-requests/${requestId}/status`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status: 'approved' })
  });
  return await response.json();
}

async function rejectRequest(requestId, reason) {
  const response = await fetch(`/api/admin/ad-requests/${requestId}/status`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      status: 'rejected',
      rejectionReason: reason
    })
  });
  return await response.json();
}
```

### 4. Admin: Create and manage ads
```javascript
async function createAd(adData) {
  const response = await fetch('/api/admin/ads', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: adData.title,
      imageUrl: adData.imageUrl,
      ctaText: adData.ctaText,
      redirectUrl: adData.redirectUrl,
      placement: adData.placement,
      device: adData.device || 'both',
      startDate: adData.startDate,
      endDate: adData.endDate
    })
  });
  return await response.json();
}

async function toggleAdStatus(adId) {
  const response = await fetch(`/api/admin/ads/${adId}/toggle`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  return await response.json();
}

async function getAdStats(adId) {
  const response = await fetch(`/api/admin/ads/${adId}`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const { data } = await response.json();
  
  return {
    impressions: data.impressions,
    clicks: data.clicks,
    ctr: (data.clicks / data.impressions * 100).toFixed(2) + '%'
  };
}
```

---

## 🔍 Query Parameters Reference

### GET /api/ads (Public)
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| placement | enum | Yes | Ad placement location |
| device | enum | No | mobile \| desktop \| both |

### GET /api/feed (Public)
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10) |
| device | enum | No | mobile \| desktop \| both |
| species | string | No | Filter by species |
| breed | string | No | Filter by breed |

### GET /api/admin/ad-requests (Admin)
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | enum | No | pending \| approved \| rejected |
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10) |

### GET /api/admin/ads (Admin)
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| placement | enum | No | Filter by placement |
| device | enum | No | mobile \| desktop \| both |
| isActive | boolean | No | Filter by active status |
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10) |

---

## ⚠️ Common Errors

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    { "field": "title", "message": "Title is required" }
  ]
}
```
**Solution:** Check request body against validation schema

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid token"
}
```
**Solution:** Provide valid JWT token in Authorization header

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied"
}
```
**Solution:** Ensure user has admin role

### 404 Not Found
```json
{
  "success": false,
  "message": "Ad not found"
}
```
**Solution:** Check if ID is correct and resource exists

---

## 📊 Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation completed",
  "data": { ... }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

### Feed Response
```json
{
  "success": true,
  "data": [
    { "type": "pet", "data": {...} },
    { "type": "pet", "data": {...} },
    { "type": "ad", "data": {...} }
  ],
  "pagination": {...}
}
```

---

## 🎨 Frontend Integration Checklist

- [ ] Fetch ads by placement for each page
- [ ] Implement Intersection Observer for impression tracking
- [ ] Track clicks before redirect
- [ ] Handle "no ads available" case gracefully
- [ ] Implement feed pagination
- [ ] Display inline ads in feed
- [ ] Admin dashboard for ad management
- [ ] Ad request form (public)
- [ ] Ad approval workflow (admin)
- [ ] Ad performance metrics (admin)

---

## 🔗 Related Documentation

- **Full API Documentation:** `AD_SYSTEM_API_DOCUMENTATION.md`
- **Implementation Summary:** `AD_SYSTEM_IMPLEMENTATION_SUMMARY.md`
- **System Architecture:** `AD_SYSTEM_ARCHITECTURE.md`

---

## 💡 Tips

1. **Tracking Best Practices:**
   - Use Intersection Observer for impressions (don't track immediately on render)
   - Track clicks before redirect for accuracy
   - Consider debouncing if needed

2. **Performance:**
   - Cache active ads on frontend for 5-10 minutes
   - Use pagination for feed
   - Lazy load ad images

3. **Testing:**
   - Test with date ranges (past, current, future)
   - Test device filtering
   - Test feed with various pet counts
   - Test tracking endpoints with high concurrency

4. **Admin Workflow:**
   - Review ad requests regularly
   - Set reasonable date ranges
   - Monitor ad performance (impressions/clicks)
   - Disable underperforming ads

5. **Security:**
   - Validate all URLs (imageUrl, redirectUrl)
   - Sanitize user input
   - Rate limit tracking endpoints
   - Monitor for abuse
