import express from "express";
import { verifyToken, requireRole, requireSellerVerified } from "../shared/middlewares/auth.middleware";
import { documentUpload, uploadPet } from "../shared/middlewares/upload";
import { handleMulterErrors } from "../shared/middlewares/uploadErrors";
import {
    SellerFromRequestController,
    enableSellerModeController,
    uploadSellerDocumentsController,
    getSellerVerificationStatusController,
    getSellerAnalyticsController
} from "../modules/seller";
import {
    addPetController,
    getPetsBySellerController,
    deletePetController,
    UpdatePetController
} from "../modules/pet";

export const sellerRouter = express.Router();

// ============= NEW DUAL-MODE SELLER ENDPOINTS (Backward Compatible) =============

// Enable seller mode for a user (buyer can toggle to seller)
sellerRouter.post(
    "/enable",
    verifyToken,
    enableSellerModeController
);

// Upload verification documents
const uploadDocFields = documentUpload.fields([
    { name: 'idProof', maxCount: 1 },
    { name: 'certificate', maxCount: 1 },
    { name: 'shopImage', maxCount: 1 }
]);

sellerRouter.post(
    "/upload-documents",
    verifyToken,
    handleMulterErrors(uploadDocFields),
    uploadSellerDocumentsController
);

// Get seller verification status
sellerRouter.get(
    "/verification-status",
    verifyToken,
    getSellerVerificationStatusController
);

// Get seller analytics
sellerRouter.get(
    "/analytics",
    verifyToken,
    requireSellerVerified,
    getSellerAnalyticsController
);

// Create new listing (requires verified seller)
sellerRouter.post(
    "/listings",
    verifyToken,
    requireSellerVerified,
    uploadPet.array('images', 3),
    addPetController
);

// Update listing
sellerRouter.put(
    "/listings/:petId",
    verifyToken,
    requireSellerVerified,
    UpdatePetController
);

// Delete listing
sellerRouter.delete(
    "/listings/:petId",
    verifyToken,
    requireSellerVerified,
    deletePetController
);

// Get all seller listings
sellerRouter.get(
    "/listings",
    verifyToken,
    requireSellerVerified,
    getPetsBySellerController
);

// ============= EXISTING SELLER VERIFICATION REQUEST (Keep for backward compatibility) =============
// Multer upload configuration for seller request documents
const uploadFields = documentUpload.fields([
    { name: 'idProof', maxCount: 1 },
    { name: 'certificate', maxCount: 1 },
    { name: 'shopImage', maxCount: 1 }
]);

// Submit seller verification request (OLD FLOW - Keep intact)
sellerRouter.post(
    "/request",
    verifyToken,
    requireRole(["seller"]),
    handleMulterErrors(uploadFields),
    SellerFromRequestController
);

// ============= PET MANAGEMENT (OLD FLOW - Keep intact) =============
// Add a new pet
sellerRouter.post(
    "/pet",
    verifyToken,
    requireRole(["seller"]),
    uploadPet.array('images', 3),
    addPetController
);

// Get all pets by seller
sellerRouter.get(
    "/pets",
    verifyToken,
    requireRole(["seller"]),
    getPetsBySellerController
);

// Delete pet by ID
sellerRouter.delete(
    "/pet/:petId",
    verifyToken,
    requireRole(["seller"]),
    deletePetController
);

// Update pet by ID
sellerRouter.patch(
    "/pet/:petId",
    verifyToken,
    requireRole(["seller"]),
    UpdatePetController
);
