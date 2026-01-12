import express from "express";
import { verifyToken, requireRole, requireSellerVerified } from "../shared/middlewares/auth.middleware";
import { documentUpload, uploadPet } from "../shared/middlewares/upload";
import { handleMulterErrors } from "../shared/middlewares/uploadErrors";
import {
    SellerFromRequestController,
    getSellerDetailsController,
    getMySellerProfileController,
    updateSellerProfileController
} from "../modules/seller";
import {
    addPetController,
    getPetsBySellerController,
    getPetByIdForSellerController,
    deletePetController,
    UpdatePetController,
    getPetCountBySellerController,
    requestFeaturedStatusController
} from "../modules/pet";

export const sellerRouter = express.Router();

// ============= SELLER VERIFICATION REQUEST =============
// Multer upload configuration for seller request documents
const uploadFields = documentUpload.fields([
    { name: 'idProof', maxCount: 1 },
    { name: 'certificate', maxCount: 1 },
    { name: 'shopImage', maxCount: 1 }
]);

// Submit seller verification request (or re-submit after rejection)
// Any authenticated user can apply to become a seller
sellerRouter.post(
    "/request",
    verifyToken,
    handleMulterErrors(uploadFields),
    SellerFromRequestController
);

// ============= PET MANAGEMENT =============
// Get pet count (specific route - must come before /pet/:petId)
sellerRouter.get(
    "/pet-count",
    verifyToken,
    requireSellerVerified,
    getPetCountBySellerController
);

// Get all pets by seller (specific route - must come before /pet/:petId)
sellerRouter.get(
    "/pets",
    verifyToken,
    requireSellerVerified,
    getPetsBySellerController
);

// Add a new pet
sellerRouter.post(
    "/pet",
    verifyToken,
    requireSellerVerified,
    uploadPet.array('images', 3),
    addPetController
);

// Get single pet by ID (with full details)
sellerRouter.get(
    "/pet/:petId",
    verifyToken,
    requireSellerVerified,
    getPetByIdForSellerController
);

// Update pet by ID
sellerRouter.patch(
    "/pet/:petId",
    verifyToken,
    requireSellerVerified,
    UpdatePetController
);

// Delete pet by ID
sellerRouter.delete(
    "/pet/:petId",
    verifyToken,
    requireSellerVerified,
    deletePetController
);

// ============= FEATURED PET REQUESTS =============
// Request featured status for a pet
sellerRouter.post(
    "/pets/:petId/featured-request",
    verifyToken,
    requireSellerVerified,
    requestFeaturedStatusController
);

// ============= SELLER PROFILE =============
// Get seller details by seller ID (public route)
sellerRouter.get(
    "/details/:sellerId",
    getSellerDetailsController
);

// Get authenticated seller's own profile
sellerRouter.get(
    "/profile",
    verifyToken,
    requireSellerVerified,
    getMySellerProfileController
);

// Update seller profile (brandName, bio, whatsappNumber, location, logo)
sellerRouter.patch(
    "/profile",
    verifyToken,
    requireSellerVerified,
    documentUpload.single('logo'),
    updateSellerProfileController
);
