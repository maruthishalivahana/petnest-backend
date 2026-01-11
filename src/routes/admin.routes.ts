import express from "express";
import { verifyToken, requireRole } from "../shared/middlewares/auth.middleware";
import {
    getAllUsersController,
    getUserByIdController,
    deleteuserByIdController,
    getUsersByRoleController,
    banUserController,
    unbanUserController,
    changeAdStatusController,
    // Admin Dashboard Controllers
    getSellerVerificationStatsController,
    getSellersByStatusController,
    getPetVerificationStatsController,
    getPetsByVerificationStatusController,
    getUserManagementStatsController,
    getFilteredUsersController,
    getUserDetailsController,
    // Analytics Controllers
    getSpeciesAnalyticsController,
    getBreedsAnalyticsController
} from "../modules/user";
import {
    getAdByIdController,
    deleteAdListingController,
    updateAdvertisementStatusController,
    getAllApprovedAdvertisementsController,
    getAllAdListingsController,
    // getAllAdListingsController,

} from "../modules/user";
import {
    getAllPendingRequestsController,
    verifySellerRequestController,
    getAllVerifiedSellersController
} from "../modules/seller";
import {
    getAllAdRequests,
    updateAdRequestStatus
} from "../modules/adRequest";
import {
    addSpeciesController,
    getAllSpeciesController,
    getSpeciesByIdController,
    deleteSpeciesByIdController
} from "../modules/species";
import {
    addBreedController,
    getAllBreedsController,
    getBreedByIdController,
    deleteBreedByIdController
} from "../modules/breed";
import {
    updatePetStatusController,
    getAllnotVerifiedPetsController,
    getPendingFeaturedRequestsController,
    approveFeaturedRequestController,
    rejectFeaturedRequestController
} from "../modules/pet";
import { getAllAdvertisementsController, getAllPendingAdvertisementsController } from "../modules/user";
import { createAdListingController } from "../modules/user";
import { uploadAd } from "@shared/middlewares/upload";

export const adminRouter = express.Router();

// ============= DEBUG ROUTE (Remove after debugging) =============
// Check current user's role
adminRouter.get(
    '/debug/check-role',
    verifyToken,
    (req, res) => {
        res.json({
            user: req.user,
            message: 'If you can see this, your token is valid. Check the role field.'
        });
    }
);

// ============= DASHBOARD STATISTICS =============
// Get seller verification statistics
adminRouter.get(
    '/dashboard/seller-verification-stats',
    verifyToken,
    requireRole(['admin']),
    getSellerVerificationStatsController
);

// Get sellers by status (pending/verified/rejected)
adminRouter.get(
    '/dashboard/sellers/:status',
    verifyToken,
    requireRole(['admin']),
    getSellersByStatusController
);

// Get pet verification statistics
adminRouter.get(
    '/dashboard/pet-verification-stats',
    verifyToken,
    requireRole(['admin']),
    getPetVerificationStatsController
);

// Get pets by verification status (pending/approved/rejected)
adminRouter.get(
    '/dashboard/pets/:status',
    verifyToken,
    requireRole(['admin']),
    getPetsByVerificationStatusController
);

// Get user management statistics
adminRouter.get(
    '/dashboard/user-management-stats',
    verifyToken,
    requireRole(['admin']),
    getUserManagementStatsController
);

// Get filtered users with search, pagination
adminRouter.get(
    '/dashboard/users',
    verifyToken,
    requireRole(['admin']),
    getFilteredUsersController
);

// Get detailed user info
adminRouter.get(
    '/dashboard/users/:userId',
    verifyToken,
    requireRole(['admin']),
    getUserDetailsController
);

// ============= USER MANAGEMENT =============
// Get all users
adminRouter.get(
    '/users',
    verifyToken,
    requireRole(['admin']),
    getAllUsersController
);

// Get user by ID
adminRouter.get(
    '/users/:userId',
    verifyToken,
    requireRole(['admin']),
    getUserByIdController
);

// Delete user by ID
adminRouter.delete(
    '/users/:userId',
    verifyToken,
    requireRole(['admin']),
    deleteuserByIdController
);

// Get users by role
adminRouter.get(
    '/users/role/:role',
    verifyToken,
    requireRole(['admin']),
    getUsersByRoleController
);

// Ban user
adminRouter.patch(
    '/users/:userId/ban',
    verifyToken,
    requireRole(['admin']),
    banUserController
);

// Unban user
adminRouter.patch(
    '/users/:userId/unban',
    verifyToken,
    requireRole(['admin']),
    unbanUserController
);

// ============= SELLER VERIFICATION =============
// Get all pending seller requests
adminRouter.get(
    '/seller-requests/pending',
    verifyToken,
    requireRole(['admin']),
    getAllPendingRequestsController
);

// Get all verified sellers
adminRouter.get(
    '/sellers/verified',
    verifyToken,
    requireRole(['admin']),
    getAllVerifiedSellersController
);

// Verify/reject seller request
adminRouter.put(
    '/seller-requests/:sellerRequestId/:status',
    verifyToken,
    requireRole(['admin']),
    verifySellerRequestController
);

// ============= SPECIES MANAGEMENT =============
// Add species
adminRouter.post(
    '/species',
    verifyToken,
    requireRole(['admin']),
    addSpeciesController
);

// Get all species
adminRouter.get(
    '/species',
    verifyToken,
    requireRole(['admin']),
    getAllSpeciesController
);

// Get species analytics (must come BEFORE /:id route)
adminRouter.get(
    '/species/analytics',
    verifyToken,
    requireRole(['admin']),
    getSpeciesAnalyticsController
);

// Get species by ID
adminRouter.get(
    '/species/:id',
    verifyToken,
    requireRole(['admin']),
    getSpeciesByIdController
);

// Delete species by ID
adminRouter.delete(
    '/species/:id',
    verifyToken,
    requireRole(['admin']),
    deleteSpeciesByIdController
);

// ============= BREED MANAGEMENT =============
// Add breed
adminRouter.post(
    '/breeds',
    verifyToken,
    requireRole(['admin']),
    addBreedController
);

// Get all breeds
adminRouter.get(
    '/breeds',
    verifyToken,
    getAllBreedsController
);

// Get breeds analytics (must come BEFORE /:id route)
adminRouter.get(
    '/breeds/analytics',
    verifyToken,
    requireRole(['admin']),
    getBreedsAnalyticsController
);

// Get breed by ID
adminRouter.get(
    '/breeds/:id',
    verifyToken,
    requireRole(['admin']),
    getBreedByIdController
);

// Delete breed by ID
adminRouter.delete(
    '/breeds/:id',
    verifyToken,
    requireRole(['admin']),
    deleteBreedByIdController
);

// ============= PET VERIFICATION =============
// Get all unverified pets
adminRouter.get(
    '/pets/not-verified',
    verifyToken,
    requireRole(['admin']),
    getAllnotVerifiedPetsController
);

// Get pending featured requests
adminRouter.get(
    '/pets/featured-requests',
    verifyToken,
    requireRole(['admin']),
    getPendingFeaturedRequestsController
);

// Approve featured request
adminRouter.patch(
    '/pets/:petId/featured/approve',
    verifyToken,
    requireRole(['admin']),
    approveFeaturedRequestController
);

// Reject featured request
adminRouter.patch(
    '/pets/:petId/featured/reject',
    verifyToken,
    requireRole(['admin']),
    rejectFeaturedRequestController
);

// Update pet verification status
adminRouter.patch(
    '/pets/:petId/:status',
    verifyToken,
    requireRole(['admin']),
    updatePetStatusController
);


// ============= ADVERTISEMENT MANAGEMENT =============
adminRouter.get(
    '/advertisements',
    verifyToken,
    requireRole(['admin']),
    getAllAdvertisementsController
);
// Get all advertisement requests (with optional status filter)
adminRouter.get(
    '/advertisements/requests',
    verifyToken,
    requireRole(['admin']),
    getAllAdRequests
);

// Update ad request status (approve/reject)
adminRouter.patch(
    '/advertisements/requests/:id/status',
    verifyToken,
    requireRole(['admin']),
    updateAdRequestStatus
);

adminRouter.get(
    '/advertisements/approved',
    verifyToken,
    requireRole(['admin']),
    getAllApprovedAdvertisementsController
);


adminRouter.post(
    '/advertisements/listing',
    verifyToken,
    requireRole(['admin']),
    uploadAd.array('images', 5),
    createAdListingController
);
adminRouter.get(
    '/advertisements/listings',
    verifyToken,
    requireRole(['admin']),
    getAllAdListingsController
);

adminRouter.patch(
    '/advertisements/:adId/status',
    verifyToken,
    requireRole(['admin']),
    changeAdStatusController
)


adminRouter.get(
    '/advertisements/:adId',
    verifyToken,
    requireRole(['admin']),
    getAdByIdController
);

// delete ad listing
adminRouter.delete(
    '/advertisements/:adId',
    verifyToken,
    requireRole(['admin']),
    deleteAdListingController
);
