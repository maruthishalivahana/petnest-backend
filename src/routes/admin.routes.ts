import express from "express";
import { verifyToken, requireRole } from "../shared/middlewares/auth.middleware";
import {
    getAllUsersController,
    getUserByIdController,
    deleteuserByIdController,
    getUsersByRoleController,
    banUserController,
    unbanUserController,
    changeAdStatusController
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
    getAllnotVerifiedPetsController
} from "../modules/pet";
import { getAllAdvertisementsController, getAllPendingAdvertisementsController } from "../modules/user";
import { createAdListingController } from "../modules/user";
import { uploadAd } from "@shared/middlewares/upload";

export const adminRouter = express.Router();

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
// Get all pending advertisement requests
adminRouter.get(
    '/advertisements/requests',
    verifyToken,
    requireRole(['admin']),
    getAllPendingAdvertisementsController
);

adminRouter.patch(
    '/ad/request/:adId/:status',
    verifyToken,
    requireRole(['admin']),
    updateAdvertisementStatusController
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
