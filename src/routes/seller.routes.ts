import express from "express";
import { verifyToken, requireRole } from "../shared/middlewares/auth.middleware";
import { documentUpload, uploadPet } from "../shared/middlewares/upload";
import { handleMulterErrors } from "../shared/middlewares/uploadErrors";
import { SellerFromRequestController } from "../modules/seller";
import {
    addPetController,
    getPetsBySellerController,
    deletePetController,
    UpdatePetController
} from "../modules/pet";

export const sellerRouter = express.Router();

// ============= SELLER VERIFICATION REQUEST =============
// Multer upload configuration for seller request documents
const uploadFields = documentUpload.fields([
    { name: 'idProof', maxCount: 1 },
    { name: 'certificate', maxCount: 1 },
    { name: 'shopImage', maxCount: 1 }
]);

// Submit seller verification request
sellerRouter.post(
    "/request",
    verifyToken,
    requireRole(["seller"]),
    handleMulterErrors(uploadFields),
    SellerFromRequestController
);

// ============= PET MANAGEMENT =============
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
