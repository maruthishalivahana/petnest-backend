import express from "express";
import { verifyToken, requireRole, requireSellerVerified } from "../shared/middlewares/auth.middleware";
import { documentUpload, uploadPet } from "../shared/middlewares/upload";
import { handleMulterErrors } from "../shared/middlewares/uploadErrors";
import {
    SellerFromRequestController,
    getSellerDetailsController,
    getMySellerProfileController
} from "../modules/seller";
import {
    addPetController,
    getPetsBySellerController,
    deletePetController,
    UpdatePetController,
    getPetCountBySellerController
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
// Add a new pet
sellerRouter.post(
    "/pet",
    verifyToken,
    requireSellerVerified,
    uploadPet.array('images', 3),
    addPetController
);

sellerRouter.get(
    "/pet-count",
    verifyToken,
    requireSellerVerified,
    getPetCountBySellerController
);

// Get all pets by seller
sellerRouter.get(
    "/pets",
    verifyToken,
    requireSellerVerified,
    getPetsBySellerController
);

// Delete pet by ID
sellerRouter.delete(
    "/pet/:petId",
    verifyToken,
    requireSellerVerified,
    deletePetController
);

// Update pet by ID
sellerRouter.patch(
    "/pet/:petId",
    verifyToken,
    requireSellerVerified,
    UpdatePetController
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
