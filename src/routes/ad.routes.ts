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
import {
    CreateAdRequestSchema,
    UpdateAdRequestStatusSchema,
    CreateAdSchema,
    UpdateAdSchema,
    GetAdRequestsQuerySchema,
    GetAdsQuerySchema,
    GetAdsByPlacementQuerySchema,
    GetFeedQuerySchema
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
    validateQuery(GetFeedQuerySchema),
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

// Create ad (admin only)
adRouter.post(
    '/admin/ads',
    verifyToken,
    requireRole(['admin']),
    validateBody(CreateAdSchema),
    createAd
);

// Get all ads (admin only)
adRouter.get(
    '/admin/ads',
    verifyToken,
    requireRole(['admin']),
    validateQuery(GetAdsQuerySchema),
    getAllAds
);

// Get ad by ID (admin only)
adRouter.get(
    '/admin/ads/:id',
    verifyToken,
    requireRole(['admin']),
    getAdById
);

// Update ad (admin only)
adRouter.patch(
    '/admin/ads/:id',
    verifyToken,
    requireRole(['admin']),
    validateBody(UpdateAdSchema),
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