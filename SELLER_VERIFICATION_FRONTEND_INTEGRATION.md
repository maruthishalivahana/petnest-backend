# Seller Verification - Frontend Integration Guide

## Overview
This guide provides comprehensive instructions for integrating the Seller Verification admin panel with the PetNest backend API.

---

## 📋 Table of Contents
1. [API Endpoints](#api-endpoints)
2. [Data Models](#data-models)
3. [Frontend Implementation](#frontend-implementation)
4. [API Integration Examples](#api-integration-examples)
5. [Error Handling](#error-handling)
6. [Security Considerations](#security-considerations)

---

## 🔗 API Endpoints

### Base URL
```
http://localhost:3000/api/v1/admin
```

### Authentication
All admin endpoints require:
- **Authorization Header**: `Bearer <admin_jwt_token>`
- **Role Required**: `admin`

### Available Endpoints

#### 1. Get Seller Verification Statistics
Get counts for pending, verified, and rejected sellers.

**Endpoint**: `GET /dashboard/seller-verification-stats`

**Response**:
```json
{
  "success": true,
  "data": {
    "pending": 12,
    "verified": 45,
    "rejected": 3,
    "suspended": 1,
    "total": 61
  }
}
```

---

#### 2. Get Sellers by Status
Retrieve all sellers filtered by verification status.

**Endpoint**: `GET /dashboard/sellers/:status`

**Parameters**:
- `status`: `pending` | `verified` | `rejected`

**Response**:
```json
{
  "success": true,
  "count": 12,
  "data": [
    {
      "_id": "seller_id_123",
      "userId": {
        "_id": "user_id_123",
        "name": "John Doe",
        "email": "john@example.com",
        "phoneNumber": "+919876543210"
      },
      "brandName": "Pawsome Pets",
      "logoUrl": "https://cloudinary.com/logo.jpg",
      "bio": "Quality pet supplies since 2020",
      "whatsappNumber": "+919876543210",
      "location": {
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400001"
      },
      "documents": {
        "idProof": "https://cloudinary.com/id_proof.pdf",
        "certificate": "https://cloudinary.com/certificate.pdf",
        "shopImage": "https://cloudinary.com/shop.jpg"
      },
      "status": "pending",
      "verificationNotes": null,
      "verificationDate": null,
      "createdAt": "2024-12-01T10:30:00Z",
      "updatedAt": "2024-12-01T10:30:00Z"
    }
  ]
}
```

---

#### 3. Approve/Reject Seller Request
Update seller verification status with admin notes.

**Endpoint**: `PATCH /seller-verification/:sellerRequestId/:status`

**Parameters**:
- `sellerRequestId`: MongoDB ObjectId of the seller request
- `status`: `verified` | `rejected` | `suspended`

**Request Body**:
```json
{
  "notes": "All documents verified successfully" // Optional
}
```

**Response**:
```json
{
  "success": true,
  "message": "Seller request verified successfully",
  "seller": {
    "_id": "seller_id_123",
    "status": "verified",
    "verificationNotes": "All documents verified successfully",
    "verificationDate": "2024-12-30T10:30:00Z"
  }
}
```

---

## 📦 Data Models

### Seller Object Structure
```typescript
interface Seller {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phoneNumber: string;
  };
  brandName: string;
  logoUrl: string;
  bio?: string;
  whatsappNumber?: string;
  location?: {
    city?: string;
    state?: string;
    pincode?: string;
  };
  documents: {
    idProof: string;
    certificate: string;
    shopImage?: string;
  };
  status: 'pending' | 'verified' | 'rejected' | 'suspended';
  verificationNotes?: string;
  verificationDate?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Statistics Object Structure
```typescript
interface SellerVerificationStats {
  pending: number;
  verified: number;
  rejected: number;
  suspended: number;
  total: number;
}
```

---

## 💻 Frontend Implementation

### 1. API Service Layer (TypeScript/JavaScript)

Create an API service file: `services/adminSellerService.ts`

```typescript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || ;

// Axios instance with authentication
const adminAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request
adminAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken'); // or use your state management
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Seller Verification API Service
export const sellerVerificationAPI = {
  // Get statistics
  getStats: async () => {
    const response = await adminAPI.get('/admin/dashboard/seller-verification-stats');
    return response.data;
  },

  // Get sellers by status
  getSellersByStatus: async (status: 'pending' | 'verified' | 'rejected') => {
    const response = await adminAPI.get(`/admin/dashboard/sellers/${status}`);
    return response.data;
  },

  // Approve seller
  approveSeller: async (sellerId: string, notes?: string) => {
    const response = await adminAPI.patch(
      `/admin/seller-verification/${sellerId}/verified`,
      { notes }
    );
    return response.data;
  },

  // Reject seller
  rejectSeller: async (sellerId: string, notes?: string) => {
    const response = await adminAPI.patch(
      `/admin/seller-verification/${sellerId}/rejected`,
      { notes }
    );
    return response.data;
  },

  // Suspend seller
  suspendSeller: async (sellerId: string, notes?: string) => {
    const response = await adminAPI.patch(
      `/admin/seller-verification/${sellerId}/suspended`,
      { notes }
    );
    return response.data;
  },
};
```

---

### 2. React Component Example

Create a component: `components/admin/SellerVerification.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { sellerVerificationAPI } from '../../services/adminSellerService';

interface Seller {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phoneNumber: string;
  };
  brandName: string;
  whatsappNumber?: string;
  status: 'pending' | 'verified' | 'rejected' | 'suspended';
  createdAt: string;
  documents: {
    idProof: string;
    certificate: string;
    shopImage?: string;
  };
}

interface Stats {
  pending: number;
  verified: number;
  rejected: number;
  total: number;
}

const SellerVerification: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'verified' | 'rejected'>('pending');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await sellerVerificationAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Handle error (show toast/notification)
    }
  };

  // Fetch sellers by status
  const fetchSellers = async (status: 'pending' | 'verified' | 'rejected') => {
    setLoading(true);
    try {
      const response = await sellerVerificationAPI.getSellersByStatus(status);
      setSellers(response.data);
    } catch (error) {
      console.error('Error fetching sellers:', error);
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  // Handle approve action
  const handleApprove = async (sellerId: string) => {
    if (!window.confirm('Are you sure you want to approve this seller?')) return;

    setActionLoading(sellerId);
    try {
      await sellerVerificationAPI.approveSeller(sellerId, 'Documents verified successfully');
      // Refresh data
      await fetchStats();
      await fetchSellers(activeTab);
      // Show success message
      alert('Seller approved successfully');
    } catch (error) {
      console.error('Error approving seller:', error);
      alert('Failed to approve seller');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle reject action
  const handleReject = async (sellerId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    setActionLoading(sellerId);
    try {
      await sellerVerificationAPI.rejectSeller(sellerId, reason);
      // Refresh data
      await fetchStats();
      await fetchSellers(activeTab);
      // Show success message
      alert('Seller rejected successfully');
    } catch (error) {
      console.error('Error rejecting seller:', error);
      alert('Failed to reject seller');
    } finally {
      setActionLoading(null);
    }
  };

  // Load data on mount and tab change
  useEffect(() => {
    fetchStats();
    fetchSellers(activeTab);
  }, [activeTab]);

  return (
    <div className="seller-verification">
      <h1>Seller Verification</h1>
      <p>Review and approve seller verification requests</p>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card pending">
          <h3>Pending</h3>
          <p className="count">{stats?.pending || 0}</p>
        </div>
        <div className="stat-card approved">
          <h3>Approved</h3>
          <p className="count">{stats?.verified || 0}</p>
        </div>
        <div className="stat-card rejected">
          <h3>Rejected</h3>
          <p className="count">{stats?.rejected || 0}</p>
        </div>
      </div>

      {/* Verification Requests Table */}
      <div className="verification-requests">
        <h2>Verification Requests</h2>

        {/* Status Tabs */}
        <div className="tabs">
          <button
            className={activeTab === 'pending' ? 'active' : ''}
            onClick={() => setActiveTab('pending')}
          >
            Pending ({stats?.pending || 0})
          </button>
          <button
            className={activeTab === 'verified' ? 'active' : ''}
            onClick={() => setActiveTab('verified')}
          >
            Approved ({stats?.verified || 0})
          </button>
          <button
            className={activeTab === 'rejected' ? 'active' : ''}
            onClick={() => setActiveTab('rejected')}
          >
            Rejected ({stats?.rejected || 0})
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <p>Loading...</p>
        ) : sellers.length === 0 ? (
          <p>No verification requests found</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Seller</th>
                <th>Business</th>
                <th>Contact</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((seller) => (
                <tr key={seller._id}>
                  <td>
                    <div>
                      <strong>{seller.userId.name}</strong>
                      <br />
                      <small>{seller.userId.email}</small>
                    </div>
                  </td>
                  <td>{seller.brandName}</td>
                  <td>
                    {seller.whatsappNumber || seller.userId.phoneNumber}
                  </td>
                  <td>
                    {new Date(seller.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <span className={`badge ${seller.status}`}>
                      {seller.status}
                    </span>
                  </td>
                  <td>
                    {activeTab === 'pending' && (
                      <div className="action-buttons">
                        <button
                          onClick={() => handleApprove(seller._id)}
                          disabled={actionLoading === seller._id}
                          className="btn-approve"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(seller._id)}
                          disabled={actionLoading === seller._id}
                          className="btn-reject"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => window.open(seller.documents.idProof, '_blank')}
                          className="btn-view"
                        >
                          View Documents
                        </button>
                      </div>
                    )}
                    {activeTab !== 'pending' && (
                      <button
                        onClick={() => window.open(seller.documents.idProof, '_blank')}
                        className="btn-view"
                      >
                        View Details
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SellerVerification;
```

---

### 3. State Management (Optional - Redux/Zustand)

If using Redux Toolkit:

```typescript
// store/slices/sellerVerificationSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sellerVerificationAPI } from '../../services/adminSellerService';

export const fetchSellerStats = createAsyncThunk(
  'sellerVerification/fetchStats',
  async () => {
    const response = await sellerVerificationAPI.getStats();
    return response.data;
  }
);

export const fetchSellersByStatus = createAsyncThunk(
  'sellerVerification/fetchByStatus',
  async (status: 'pending' | 'verified' | 'rejected') => {
    const response = await sellerVerificationAPI.getSellersByStatus(status);
    return response.data;
  }
);

const sellerVerificationSlice = createSlice({
  name: 'sellerVerification',
  initialState: {
    stats: null,
    sellers: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSellerStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchSellersByStatus.fulfilled, (state, action) => {
        state.sellers = action.payload;
        state.loading = false;
      });
  },
});

export default sellerVerificationSlice.reducer;
```

---

## 🎯 API Integration Examples

### Using Fetch API (Alternative to Axios)

```javascript
// Get statistics
async function getSellerStats() {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(
      'http://localhost:3000/api/v1/admin/dashboard/seller-verification-stats',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Approve seller
async function approveSeller(sellerId, notes) {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(
      `http://localhost:3000/api/v1/admin/seller-verification/${sellerId}/verified`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to approve seller');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

---

## ⚠️ Error Handling

### Common Error Responses

```typescript
// 401 Unauthorized - No token or invalid token
{
  "message": "Access token is required" 
}

// 403 Forbidden - Not an admin
{
  "message": "Access forbidden: Admins only"
}

// 400 Bad Request - Invalid status
{
  "success": false,
  "message": "Invalid status. Must be 'pending', 'verified', or 'rejected'"
}

// 404 Not Found - Seller not found
{
  "message": "Seller request not found"
}

// 500 Internal Server Error
{
  "success": false,
  "message": "Failed to fetch seller verification stats",
  "error": "Error details..."
}
```

### Error Handling Implementation

```typescript
const handleAPIError = (error: any) => {
  if (error.response) {
    // Server responded with error
    const status = error.response.status;
    const message = error.response.data.message;

    switch (status) {
      case 401:
        // Redirect to login
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
        break;
      case 403:
        alert('Access denied. Admin privileges required.');
        break;
      case 404:
        alert('Seller request not found.');
        break;
      default:
        alert(message || 'An error occurred. Please try again.');
    }
  } else if (error.request) {
    // Request made but no response
    alert('Network error. Please check your connection.');
  } else {
    // Something else happened
    alert('An unexpected error occurred.');
  }
};
```

---

## 🔒 Security Considerations

### 1. Token Management
- Store admin JWT token securely (HttpOnly cookies preferred)
- Implement token refresh mechanism
- Clear token on logout

### 2. Role-Based Access
```typescript
// Verify admin role before rendering admin pages
const ProtectedAdminRoute = ({ children }) => {
  const user = useAuth(); // Your auth hook
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" />;
  }
  
  return children;
};
```

### 3. Input Validation
```typescript
// Validate notes before submission
const validateNotes = (notes: string) => {
  if (notes.length > 500) {
    throw new Error('Notes cannot exceed 500 characters');
  }
  return notes.trim();
};
```

### 4. CORS Configuration
Ensure your backend allows requests from your frontend domain:
```typescript
// In your backend server.ts
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
```

---

## 📱 Responsive Design Considerations

```css
/* Example styles for mobile responsiveness */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  table {
    display: block;
    overflow-x: auto;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
```

---

## 🧪 Testing

### API Testing with Postman/Thunder Client

```bash
# 1. Get Stats
GET http://localhost:3000/api/v1/admin/dashboard/seller-verification-stats
Headers:
  Authorization: Bearer <your_admin_token>

# 2. Get Pending Sellers
GET http://localhost:3000/api/v1/admin/dashboard/sellers/pending
Headers:
  Authorization: Bearer <your_admin_token>

# 3. Approve Seller
PATCH http://localhost:3000/api/v1/admin/seller-verification/{sellerId}/verified
Headers:
  Authorization: Bearer <your_admin_token>
  Content-Type: application/json
Body:
{
  "notes": "Documents verified successfully"
}
```

---

## 🚀 Quick Start Checklist

- [ ] Set up admin authentication (JWT token)
- [ ] Create API service layer with authentication headers
- [ ] Implement statistics fetching on page load
- [ ] Create seller list component with status filtering
- [ ] Add approve/reject action handlers
- [ ] Implement document viewing functionality
- [ ] Add error handling and loading states
- [ ] Test all API endpoints with valid admin token
- [ ] Implement responsive design for mobile devices
- [ ] Add confirmation dialogs for actions
- [ ] Implement success/error notifications (toast/alerts)

---

## 📞 Support

For backend API issues, check:
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
- [SECURITY_GUIDELINES.md](./SECURITY_GUIDELINES.md)

For questions or issues, contact the backend team or refer to the API documentation.

---

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- File uploads (ID proof, certificates) are stored on Cloudinary
- Seller verification is a one-time process per user
- Once approved, sellers can list pets and products
- Admins can suspend verified sellers if needed

---

**Last Updated**: December 30, 2025  
**API Version**: v1  
**Backend**: Node.js + Express + TypeScript + MongoDB
