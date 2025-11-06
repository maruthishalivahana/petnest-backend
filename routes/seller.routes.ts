import { SellerFromRequestController } from "../controllers/SellerFromRequestController/SellerFromRequest";
import express from "express";
import { verifyToken, requireRole } from "../middlewares/auth.middleware";
import { documentUpload } from "../middlewares/upload";
import { handleMulterErrors } from "../middlewares/uploadErrors";

export const sellerRouter = express.Router();

// Multer upload configuration for seller request documents
const uploadFields = documentUpload.fields([
    { name: 'idProof', maxCount: 1 },
    { name: 'certificate', maxCount: 1 },
    { name: 'shopImage', maxCount: 1 }
]);

sellerRouter.post(
    "/request",
    verifyToken,
    requireRole(["seller"]),
    handleMulterErrors(uploadFields),
    SellerFromRequestController
);
