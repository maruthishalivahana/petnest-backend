import express from 'express';
import {
    createAdRequest,
    getAllAdRequests,
    updateAdRequestStatus
} from '@modules/adRequest';
import {
    createAd,
    getAllAds,
    getActiveAds,
    getAdById,
    updateAd,
    deleteAd,
    toggleAdStatus,
    getAdsByPlacement,
    trackImpression,
    trackClick
} from '@modules/ad';
import { getFeed } from '@modules/feed';
import { verifyToken, requireRole } from '@shared/middlewares/auth.middleware';
import { validateBody, validateQuery } from '@shared/middlewares/validation.middleware';
import { uploadAd } from '@shared/middlewares/upload';
import {
    CreateAdRequestSchema,
    UpdateAdRequestStatusSchema,
    CreateAdSchema,
    UpdateAdSchema,
    GetAdRequestsQuerySchema,
    GetAdsByPlacementQuerySchema
} from '@validations/ad.validation';

export const adRouter = express.Router();

// ============ Public Routes ============

// Public ad request submission (no auth required)
adRouter.post(
    '/ad-requests',
    validateBody(CreateAdRequestSchema),
    createAdRequest
);

// Get all active ads (public - for displaying on website)
adRouter.get(
    '/ads',
    getActiveAds
);

// Get ads by placement (public - for specific page placement)
adRouter.get(
    '/ads/placement',
    validateQuery(GetAdsByPlacementQuerySchema),
    getAdsByPlacement
);

// Track impression (public)
adRouter.post(
    '/ads/:id/impression',
    trackImpression
);

// Track click (public)
adRouter.post(
    '/ads/:id/click',
    trackClick
);

// Feed with inline ads (public)
adRouter.get(
    '/feed',
    getFeed
);

// ============ Admin Routes ============

// Get all ad requests (admin only)
adRouter.get(
    '/admin/ad-requests',
    verifyToken,
    requireRole(['admin']),
    validateQuery(GetAdRequestsQuerySchema),
    getAllAdRequests
);

// Update ad request status (admin only)
adRouter.patch(
    '/admin/ad-requests/:id/status',
    verifyToken,
    requireRole(['admin']),
    validateBody(UpdateAdRequestStatusSchema),
    updateAdRequestStatus
);

// Create ad (admin only) - with image upload
adRouter.post(
    '/admin/ads',
    verifyToken,
    requireRole(['admin']),
    uploadAd.single('image'),
    createAd
);

// Get all ads (admin only)
adRouter.get(
    '/admin/ads',
    verifyToken,
    requireRole(['admin']),
    getAllAds
);

// Get ad by ID (admin only)
adRouter.get(
    '/admin/ads/:id',
    verifyToken,
    requireRole(['admin']),
    getAdById
);

// Update ad (admin only) - with optional image upload
adRouter.patch(
    '/admin/ads/:id',
    verifyToken,
    requireRole(['admin']),
    uploadAd.single('image'),
    updateAd
);

// Delete ad (admin only)
adRouter.delete(
    '/admin/ads/:id',
    verifyToken,
    requireRole(['admin']),
    deleteAd
);

// Toggle ad status (admin only)
adRouter.patch(
    '/admin/ads/:id/toggle',
    verifyToken,
    requireRole(['admin']),
    toggleAdStatus
);