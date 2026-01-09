# Frontend Integration Prompt - Advertisement System

## Context
We have a complete advertisement system backend with the following capabilities:
- Public ad request submission (no auth)
- Admin ad management (CRUD operations)
- Placement-based ad display
- Feed integration with inline ads
- Impression and click tracking

## Backend API Base URL
```
http://localhost:3000/api
```

## Task: Build Complete Frontend Integration

Build a complete frontend integration for the advertisement system with the following requirements:

---

## 1. Public Features (No Authentication Required)

### A. Ad Request Submission Form

**Location:** Create a public page `/advertise-with-us` or modal

**Requirements:**
- Form fields:
  - Brand Name (required, text input)
  - Contact Email (required, email input with validation)
  - Contact Number (optional, phone input)
  - Requested Placement (required, dropdown with 10 options)
  - Message (optional, textarea, max 500 chars)
  - Media URL (optional, URL input for sample ad)
- Submit to: `POST /api/ad-requests`
- Show success message after submission
- Handle validation errors
- Mobile responsive design

**Placement Options for Dropdown:**
```javascript
[
  { value: 'home_top_banner', label: 'Home - Top Banner' },
  { value: 'home_sidebar', label: 'Home - Sidebar' },
  { value: 'home_footer', label: 'Home - Footer' },
  { value: 'pet_feed_inline', label: 'Pet Feed - Inline Ads' },
  { value: 'pet_mobile_sticky', label: 'Pet Pages - Mobile Sticky' },
  { value: 'pet_detail_below_desc', label: 'Pet Detail - Below Description' },
  { value: 'pet_detail_sidebar', label: 'Pet Detail - Sidebar' },
  { value: 'blog_mid_article', label: 'Blog - Mid Article' },
  { value: 'blog_sidebar', label: 'Blog - Sidebar' },
  { value: 'dashboard_header', label: 'Dashboard - Header' }
]
```

**API Endpoint:**
```javascript
POST /api/ad-requests
Body: {
  "brandName": "Pet Store Inc",
  "contactEmail": "ads@petstore.com",
  "contactNumber": "+1234567890",
  "requestedPlacement": "home_top_banner",
  "message": "We want to advertise our premium pet food",
  "mediaUrl": "https://example.com/sample-ad.jpg"
}
```

---

### B. Ad Display Components

Create reusable ad display components for all 10 placement types:

#### 1. Banner Ad Component
**Placements:** `home_top_banner`, `home_footer`, `pet_mobile_sticky`, `dashboard_header`

**Requirements:**
- Full-width responsive banner
- Image with overlay CTA button
- Click handler with tracking
- Impression tracking using Intersection Observer
- Fallback when no ads available
- Loading state

**Implementation:**
```javascript
// Fetch ad
const response = await fetch(
  `/api/ads?placement=home_top_banner&device=${isMobile ? 'mobile' : 'desktop'}`
);
const { data } = await response.json();

// Track impression when 50% visible for 1 second
const observer = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && entries[0].intersectionRatio >= 0.5) {
    setTimeout(() => {
      fetch(`/api/ads/${ad._id}/impression`, { method: 'POST' });
    }, 1000);
    observer.disconnect();
  }
}, { threshold: 0.5 });

// Track click
element.addEventListener('click', async () => {
  await fetch(`/api/ads/${ad._id}/click`, { method: 'POST' });
  window.open(ad.redirectUrl, '_blank');
});
```

#### 2. Sidebar Ad Component
**Placements:** `home_sidebar`, `pet_detail_sidebar`, `blog_sidebar`

**Requirements:**
- Vertical sidebar format (300px-350px width)
- Sticky positioning (scroll with content)
- Image + title + CTA button
- Tracking implementation
- Responsive (hide on mobile < 768px)

#### 3. Inline Ad Component
**Placements:** `pet_feed_inline`, `blog_mid_article`

**Requirements:**
- Blends with content feed
- Same dimensions as feed items
- Clear "Sponsored" label
- Tracking implementation
- Responsive design

---

### C. Feed Integration with Inline Ads

**Location:** Pet listing page, main feed page

**Requirements:**
- Fetch feed data from: `GET /api/feed?page=1&limit=12&device=mobile`
- Handle two item types: `pet` and `ad`
- Display 1 ad after every 4 pet cards
- Infinite scroll or pagination
- Each ad card tracks impressions and clicks independently
- Mobile responsive grid (1 col mobile, 2-3 cols tablet, 4 cols desktop)

**Response Format:**
```json
{
  "success": true,
  "data": [
    { "type": "pet", "data": { "_id": "...", "name": "Golden Retriever", ... } },
    { "type": "pet", "data": { ... } },
    { "type": "pet", "data": { ... } },
    { "type": "pet", "data": { ... } },
    { "type": "ad", "data": { "_id": "...", "title": "Premium Dog Food", ... } },
    { "type": "pet", "data": { ... } }
  ],
  "pagination": { "total": 120, "page": 1, "limit": 12, "totalPages": 10 }
}
```

**Implementation Guide:**
```javascript
function renderFeedItem(item) {
  if (item.type === 'pet') {
    return renderPetCard(item.data);
  } else if (item.type === 'ad') {
    return renderInlineAd(item.data);
  }
}

function renderInlineAd(ad) {
  return (
    <div className="inline-ad" data-ad-id={ad._id}>
      <span className="sponsored-label">Sponsored</span>
      <img src={ad.imageUrl} alt={ad.title} />
      <h3>{ad.title}</h3>
      <button onClick={() => handleAdClick(ad)}>
        {ad.ctaText}
      </button>
    </div>
  );
}
```

---

### D. Ad Tracking System

**Requirements:**
- Implement automatic impression tracking
- Implement click tracking
- Handle tracking failures gracefully (don't break user experience)
- Debounce impression tracking (fire once per ad per session)
- Track clicks before redirect

**Impression Tracking Rules:**
- Fire when ad is 50% visible for at least 1 second
- Use Intersection Observer API
- Track only once per ad per page load
- Don't block page rendering

**Click Tracking Rules:**
- Fire on ad click
- Wait for tracking request (max 500ms)
- Then redirect to ad.redirectUrl
- Open in new tab

**Example Implementation:**
```javascript
class AdTracker {
  constructor() {
    this.trackedImpressions = new Set();
  }

  trackImpression(adId) {
    if (this.trackedImpressions.has(adId)) return;
    
    fetch(`/api/ads/${adId}/impression`, { 
      method: 'POST',
      keepalive: true // Important for tracking when page unloads
    }).catch(() => {
      // Fail silently
    });
    
    this.trackedImpressions.add(adId);
  }

  async trackClick(adId, redirectUrl) {
    try {
      await Promise.race([
        fetch(`/api/ads/${adId}/click`, { method: 'POST' }),
        new Promise(resolve => setTimeout(resolve, 500))
      ]);
    } catch (error) {
      // Fail silently
    } finally {
      window.open(redirectUrl, '_blank');
    }
  }
}
```

---

## 2. Admin Features (Authentication Required)

### A. Admin Dashboard - Ad Requests Management

**Location:** `/admin/ad-requests`

**Requirements:**

1. **Ad Requests Table:**
   - Columns: Brand Name, Email, Placement, Status, Date, Actions
   - Filter by status: All, Pending, Approved, Rejected
   - Pagination (10 items per page)
   - Search by brand name or email
   - Fetch from: `GET /api/admin/ad-requests?status=pending&page=1&limit=10`

2. **Request Details Modal:**
   - Display all request information
   - Show media URL preview if available
   - Approve button (status: pending → approved)
   - Reject button with reason textarea (required)
   - Close button

3. **Approve Request:**
   ```javascript
   PATCH /api/admin/ad-requests/:id/status
   Body: { "status": "approved" }
   Headers: { "Authorization": "Bearer TOKEN" }
   ```

4. **Reject Request:**
   ```javascript
   PATCH /api/admin/ad-requests/:id/status
   Body: { 
     "status": "rejected",
     "rejectionReason": "Does not meet our advertising guidelines"
   }
   Headers: { "Authorization": "Bearer TOKEN" }
   ```

5. **Status Badges:**
   - Pending: Yellow/Orange badge
   - Approved: Green badge
   - Rejected: Red badge

---

### B. Admin Dashboard - Ad Management

**Location:** `/admin/ads`

**Requirements:**

1. **Create Ad Form:**
   - Fields:
     - Title (text, required)
     - Image URL (URL input, required, with preview)
     - CTA Text (text, required, max 20 chars)
     - Redirect URL (URL input, required)
     - Placement (dropdown, required)
     - Device (radio: mobile/desktop/both, default: both)
     - Target Pages (multi-input, comma-separated URLs, optional)
     - Start Date (datetime picker, required)
     - End Date (datetime picker, required)
   - Validation: End date must be after start date
   - Submit to: `POST /api/admin/ads`
   - Success: Redirect to ads list or show success message

2. **Ads List Table:**
   - Columns: Image, Title, Placement, Device, Dates, Status, Stats, Actions
   - Stats: Show impressions and clicks (e.g., "1.2K views, 87 clicks")
   - Calculate CTR (Click-Through Rate): `(clicks / impressions) * 100`
   - Filter by:
     - Placement (dropdown)
     - Device (dropdown)
     - Status: Active/Inactive
   - Pagination
   - Fetch from: `GET /api/admin/ads?page=1&limit=10`

3. **Ad Actions:**
   - **Toggle Status:** Switch between active/inactive
     ```javascript
     PATCH /api/admin/ads/:id/toggle
     ```
   - **Edit:** Open edit modal with pre-filled form
     ```javascript
     PATCH /api/admin/ads/:id
     Body: { "title": "Updated Title", ... }
     ```
   - **Delete:** Confirm dialog then delete
     ```javascript
     DELETE /api/admin/ads/:id
     ```
   - **View Stats:** Show detailed analytics modal

4. **Ad Status Toggle:**
   - Visual toggle switch
   - Green when active, gray when inactive
   - Instant update with optimistic UI
   - Revert on API failure

5. **Edit Ad Modal:**
   - Same fields as create form
   - Pre-filled with current values
   - Update button
   - Cancel button

6. **Ad Analytics Modal:**
   - Display detailed stats:
     - Total impressions
     - Total clicks
     - CTR percentage
     - Date range (start to end)
     - Days remaining
     - Average impressions per day
     - Average clicks per day
   - Performance chart (optional, if using chart library)
   - Export data button (optional)

---

## 3. Component Architecture (Suggested)

### React/Vue/Next.js Structure:

```
src/
├── components/
│   ├── ads/
│   │   ├── AdBanner.jsx              # Banner ad component
│   │   ├── AdSidebar.jsx             # Sidebar ad component
│   │   ├── AdInline.jsx              # Inline ad component
│   │   ├── AdTracker.js              # Tracking utility
│   │   └── AdRequestForm.jsx         # Public ad request form
│   │
│   ├── feed/
│   │   ├── FeedContainer.jsx         # Main feed with ads
│   │   ├── PetCard.jsx               # Pet card component
│   │   └── FeedAdCard.jsx            # Ad card for feed
│   │
│   └── admin/
│       ├── ads/
│       │   ├── AdRequestsTable.jsx   # Ad requests management
│       │   ├── AdRequestModal.jsx    # Request details modal
│       │   ├── AdsTable.jsx          # Ads list table
│       │   ├── CreateAdForm.jsx      # Create ad form
│       │   ├── EditAdModal.jsx       # Edit ad modal
│       │   └── AdStatsModal.jsx      # Ad analytics modal
│       │
│       └── layout/
│           └── AdminSidebar.jsx      # Add nav links
│
├── hooks/
│   ├── useAdTracking.js              # Ad tracking hook
│   ├── useAds.js                     # Fetch ads hook
│   └── useFeed.js                    # Fetch feed hook
│
├── services/
│   ├── adService.js                  # Ad API calls
│   └── adminService.js               # Admin API calls
│
└── pages/
    ├── advertise.jsx                 # Public ad request page
    ├── feed.jsx                      # Feed with inline ads
    └── admin/
        ├── ad-requests.jsx           # Admin ad requests page
        └── ads.jsx                   # Admin ads management page
```

---

## 4. API Integration Service

Create a service file for all API calls:

```javascript
// services/adService.js

const API_BASE = 'http://localhost:3000/api';

export const adService = {
  // Public APIs
  async submitAdRequest(data) {
    const response = await fetch(`${API_BASE}/ad-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async getAdsByPlacement(placement, device = 'both') {
    const response = await fetch(
      `${API_BASE}/ads?placement=${placement}&device=${device}`
    );
    return response.json();
  },

  async getFeed(page = 1, limit = 12, device = null) {
    const params = new URLSearchParams({ page, limit });
    if (device) params.append('device', device);
    
    const response = await fetch(`${API_BASE}/feed?${params}`);
    return response.json();
  },

  async trackImpression(adId) {
    await fetch(`${API_BASE}/ads/${adId}/impression`, {
      method: 'POST',
      keepalive: true
    });
  },

  async trackClick(adId) {
    await fetch(`${API_BASE}/ads/${adId}/click`, {
      method: 'POST',
      keepalive: true
    });
  },

  // Admin APIs (require auth token)
  async getAdRequests(token, status, page = 1, limit = 10) {
    const params = new URLSearchParams({ page, limit });
    if (status) params.append('status', status);
    
    const response = await fetch(
      `${API_BASE}/admin/ad-requests?${params}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    return response.json();
  },

  async updateAdRequestStatus(token, requestId, status, rejectionReason) {
    const response = await fetch(
      `${API_BASE}/admin/ad-requests/${requestId}/status`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, rejectionReason })
      }
    );
    return response.json();
  },

  async createAd(token, adData) {
    const response = await fetch(`${API_BASE}/admin/ads`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(adData)
    });
    return response.json();
  },

  async getAds(token, filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(
      `${API_BASE}/admin/ads?${params}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    return response.json();
  },

  async getAdById(token, adId) {
    const response = await fetch(
      `${API_BASE}/admin/ads/${adId}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    return response.json();
  },

  async updateAd(token, adId, updates) {
    const response = await fetch(
      `${API_BASE}/admin/ads/${adId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      }
    );
    return response.json();
  },

  async deleteAd(token, adId) {
    const response = await fetch(
      `${API_BASE}/admin/ads/${adId}`,
      {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    return response.json();
  },

  async toggleAdStatus(token, adId) {
    const response = await fetch(
      `${API_BASE}/admin/ads/${adId}/toggle`,
      {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    return response.json();
  }
};
```

---

## 5. Device Detection

Implement device detection for proper ad filtering:

```javascript
// utils/deviceDetection.js

export function getDeviceType() {
  const width = window.innerWidth;
  
  if (width < 768) return 'mobile';
  if (width >= 768 && width < 1024) return 'tablet';
  return 'desktop';
}

export function isMobile() {
  return getDeviceType() === 'mobile';
}

export function getAdDeviceFilter() {
  return isMobile() ? 'mobile' : 'desktop';
}

// Usage
const device = getAdDeviceFilter();
const { data } = await adService.getAdsByPlacement('home_top_banner', device);
```

---

## 6. UI/UX Requirements

### Design Guidelines:

1. **Ad Labeling:**
   - All ads must have "Sponsored" or "Ad" label
   - Label should be subtle but visible
   - Use gray text, small font size

2. **Loading States:**
   - Show skeleton/shimmer while fetching ads
   - Don't show empty space if no ads
   - Graceful fallback

3. **Error Handling:**
   - If ad fails to load, hide the ad slot
   - Don't show error messages for ad failures
   - Log errors to console for debugging

4. **Responsive Design:**
   - Mobile: Full-width banners, no sidebars
   - Tablet: Adjust banner sizes
   - Desktop: Full ad experience

5. **Performance:**
   - Lazy load ad images
   - Debounce impression tracking
   - Use Intersection Observer (not scroll events)
   - Cache ad data for 5 minutes

6. **Accessibility:**
   - Add alt text to ad images
   - Keyboard navigation support
   - ARIA labels for sponsored content

---

## 7. Admin Dashboard Navigation

Add these menu items to admin sidebar:

```javascript
{
  icon: <AdIcon />,
  label: 'Advertisements',
  children: [
    {
      label: 'Ad Requests',
      path: '/admin/ad-requests',
      badge: pendingCount // Show pending count
    },
    {
      label: 'Manage Ads',
      path: '/admin/ads'
    },
    {
      label: 'Create Ad',
      path: '/admin/ads/create'
    }
  ]
}
```

---

## 8. Testing Checklist

### Public Features:
- [ ] Ad request form submits successfully
- [ ] Form validation works (required fields, email format, URL format)
- [ ] Success message displays after submission
- [ ] Error messages display on API failure
- [ ] Banner ads display on homepage
- [ ] Sidebar ads display on appropriate pages
- [ ] Feed shows inline ads after every 4 pets
- [ ] Impression tracking fires when ad is visible
- [ ] Click tracking fires before redirect
- [ ] Ads open in new tab on click
- [ ] No ads available is handled gracefully
- [ ] Mobile responsive design works

### Admin Features:
- [ ] Ad requests table loads with pagination
- [ ] Filter by status works (pending/approved/rejected)
- [ ] Approve request updates status
- [ ] Reject request requires reason
- [ ] Create ad form validates dates (end > start)
- [ ] Create ad form submits successfully
- [ ] Ads table displays all ads with stats
- [ ] Toggle ad status works with visual feedback
- [ ] Edit ad modal pre-fills data correctly
- [ ] Update ad saves changes
- [ ] Delete ad shows confirmation and deletes
- [ ] Stats modal shows correct analytics
- [ ] CTR calculation is accurate
- [ ] All API errors are handled gracefully

### Edge Cases:
- [ ] No ads available for placement
- [ ] Network failure during tracking
- [ ] Invalid dates in ad form
- [ ] Expired ads don't show
- [ ] Future ads don't show yet
- [ ] Mobile vs desktop filtering works
- [ ] Very long brand names or titles
- [ ] Invalid image URLs
- [ ] Unauthorized access to admin routes

---

## 9. Optional Enhancements

1. **Ad Preview:** Show ad preview before publishing
2. **Analytics Dashboard:** Charts for impressions/clicks over time
3. **A/B Testing:** Test multiple ads for same placement
4. **Ad Scheduling:** Pause/resume ads
5. **Budget Tracking:** Track ad spend and limits
6. **Performance Reports:** Export CSV/PDF reports
7. **Ad Gallery:** Template library for common ad sizes
8. **Notification System:** Email admin when new request submitted

---

## 10. Required Dependencies (Suggested)

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "next": "^14.x" or "react-router-dom": "^6.x",
    "axios": "^1.x" or "use built-in fetch",
    "date-fns": "^3.x (for date formatting)",
    "react-hook-form": "^7.x (for form handling)",
    "zod": "^3.x (for validation)",
    "react-query" or "swr": "(for data fetching)",
    "tailwindcss" or "mui" or "chakra-ui": "(for styling)"
  }
}
```

---

## Summary

Build a complete advertisement system frontend with:
- ✅ Public ad request form
- ✅ Ad display components for 10 placements
- ✅ Feed integration with inline ads
- ✅ Automatic impression & click tracking
- ✅ Admin dashboard for ad requests
- ✅ Admin dashboard for ad management
- ✅ Full CRUD operations for ads
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Error handling and loading states
- ✅ Analytics and performance tracking

All API endpoints are documented above. Use the provided service layer for API calls. Follow the component architecture and UI/UX guidelines.
