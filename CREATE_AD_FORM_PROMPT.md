# Create Ad Form - Frontend Implementation Prompt

## Task
Build a "Create Ad" form for admin users to create new advertisements.

---

## API Endpoint
```
POST /api/admin/ads
Headers: Authorization: Bearer <admin_token>
```

---

## Form Fields

```javascript
{
  title: string,           // Required, min 1 char
  imageUrl: string,        // Required, must be valid URL
  ctaText: string,         // Required, min 1 char (e.g., "Shop Now", "Learn More")
  redirectUrl: string,     // Required, must be valid URL
  placement: string,       // Required, dropdown with 10 options
  device: string,          // Optional, radio buttons (mobile/desktop/both), default: "both"
  targetPages: array,      // Optional, array of strings (e.g., ["/", "/pets"])
  startDate: datetime,     // Required, must be valid date
  endDate: datetime        // Required, must be after startDate
}
```

---

## Placement Options (Dropdown)

```javascript
const placements = [
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
];
```

---

## Implementation Example

```jsx
import { useState } from 'react';

function CreateAdForm() {
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    ctaText: '',
    redirectUrl: '',
    placement: 'home_top_banner',
    device: 'both',
    targetPages: [],
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('adminToken'); // or get from auth context
      
      const response = await fetch('http://localhost:3000/api/admin/ads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        alert('Ad created successfully!');
        // Reset form or redirect to ads list
        setFormData({
          title: '',
          imageUrl: '',
          ctaText: '',
          redirectUrl: '',
          placement: 'home_top_banner',
          device: 'both',
          targetPages: [],
          startDate: '',
          endDate: ''
        });
      } else {
        setError(result.message || 'Failed to create ad');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Create New Ad</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Title */}
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">
          Title *
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          className="w-full px-3 py-2 border rounded"
          placeholder="Premium Dog Food Sale"
        />
      </div>

      {/* Image URL */}
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">
          Image URL *
        </label>
        <input
          type="url"
          required
          value={formData.imageUrl}
          onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
          className="w-full px-3 py-2 border rounded"
          placeholder="https://example.com/ad-image.jpg"
        />
        {/* Image Preview */}
        {formData.imageUrl && (
          <img 
            src={formData.imageUrl} 
            alt="Preview" 
            className="mt-2 h-32 object-cover rounded"
            onError={(e) => e.target.style.display = 'none'}
          />
        )}
      </div>

      {/* CTA Text */}
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">
          CTA Text *
        </label>
        <input
          type="text"
          required
          maxLength={20}
          value={formData.ctaText}
          onChange={(e) => setFormData({...formData, ctaText: e.target.value})}
          className="w-full px-3 py-2 border rounded"
          placeholder="Shop Now"
        />
        <small className="text-gray-500">Max 20 characters</small>
      </div>

      {/* Redirect URL */}
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">
          Redirect URL *
        </label>
        <input
          type="url"
          required
          value={formData.redirectUrl}
          onChange={(e) => setFormData({...formData, redirectUrl: e.target.value})}
          className="w-full px-3 py-2 border rounded"
          placeholder="https://yourstore.com/products"
        />
      </div>

      {/* Placement */}
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">
          Placement *
        </label>
        <select
          required
          value={formData.placement}
          onChange={(e) => setFormData({...formData, placement: e.target.value})}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="home_top_banner">Home - Top Banner</option>
          <option value="home_sidebar">Home - Sidebar</option>
          <option value="home_footer">Home - Footer</option>
          <option value="pet_feed_inline">Pet Feed - Inline Ads</option>
          <option value="pet_mobile_sticky">Pet Pages - Mobile Sticky</option>
          <option value="pet_detail_below_desc">Pet Detail - Below Description</option>
          <option value="pet_detail_sidebar">Pet Detail - Sidebar</option>
          <option value="blog_mid_article">Blog - Mid Article</option>
          <option value="blog_sidebar">Blog - Sidebar</option>
          <option value="dashboard_header">Dashboard - Header</option>
        </select>
      </div>

      {/* Device */}
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">
          Device Target
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="mobile"
              checked={formData.device === 'mobile'}
              onChange={(e) => setFormData({...formData, device: e.target.value})}
              className="mr-2"
            />
            Mobile
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="desktop"
              checked={formData.device === 'desktop'}
              onChange={(e) => setFormData({...formData, device: e.target.value})}
              className="mr-2"
            />
            Desktop
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="both"
              checked={formData.device === 'both'}
              onChange={(e) => setFormData({...formData, device: e.target.value})}
              className="mr-2"
            />
            Both
          </label>
        </div>
      </div>

      {/* Start Date */}
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">
          Start Date *
        </label>
        <input
          type="datetime-local"
          required
          value={formData.startDate}
          onChange={(e) => setFormData({...formData, startDate: e.target.value})}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      {/* End Date */}
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">
          End Date *
        </label>
        <input
          type="datetime-local"
          required
          value={formData.endDate}
          onChange={(e) => setFormData({...formData, endDate: e.target.value})}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      {/* Target Pages (Optional) */}
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">
          Target Pages (Optional)
        </label>
        <input
          type="text"
          value={formData.targetPages.join(', ')}
          onChange={(e) => setFormData({
            ...formData, 
            targetPages: e.target.value.split(',').map(p => p.trim()).filter(Boolean)
          })}
          className="w-full px-3 py-2 border rounded"
          placeholder="/home, /pets, /blog"
        />
        <small className="text-gray-500">Comma-separated URLs</small>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Creating...' : 'Create Ad'}
      </button>
    </form>
  );
}

export default CreateAdForm;
```

---

## Success Response
```json
{
  "success": true,
  "message": "Ad created successfully",
  "data": {
    "_id": "67890abcdef",
    "title": "Premium Dog Food Sale",
    "imageUrl": "https://example.com/ad.jpg",
    "ctaText": "Shop Now",
    "redirectUrl": "https://store.com/sale",
    "placement": "home_top_banner",
    "device": "both",
    "targetPages": [],
    "startDate": "2026-01-10T00:00:00.000Z",
    "endDate": "2026-02-10T23:59:59.000Z",
    "impressions": 0,
    "clicks": 0,
    "isActive": true,
    "createdAt": "2026-01-09T...",
    "updatedAt": "2026-01-09T..."
  }
}
```

---

## Error Response
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "endDate",
      "message": "End date must be after start date"
    }
  ]
}
```

---

## Validation Rules

1. **Title**: Required, minimum 1 character
2. **Image URL**: Required, must be valid URL format
3. **CTA Text**: Required, minimum 1 character
4. **Redirect URL**: Required, must be valid URL format
5. **Placement**: Required, must be one of 10 placement options
6. **Device**: Optional, defaults to "both"
7. **Start Date**: Required, must be valid datetime
8. **End Date**: Required, must be after start date
9. **Target Pages**: Optional, array of URL strings

---

## Quick Test

```bash
# Using curl (replace YOUR_ADMIN_TOKEN)
curl -X POST http://localhost:3000/api/admin/ads \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Premium Pet Food",
    "imageUrl": "https://picsum.photos/800/400",
    "ctaText": "Shop Now",
    "redirectUrl": "https://example.com/shop",
    "placement": "home_top_banner",
    "device": "both",
    "startDate": "2026-01-10T00:00:00Z",
    "endDate": "2026-02-10T23:59:59Z"
  }'
```

---

## Notes

- Form requires admin authentication token
- Image URL should be validated (show preview)
- End date must be after start date (validate on submit)
- Use datetime-local input for date/time selection
- Show loading state during submission
- Display success message or redirect after creation
- Handle validation errors from backend
