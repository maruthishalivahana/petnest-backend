import { SellerFromRequestController } from "../controllers/SellerController/SellerFromRequest";
import express from "express";
import { verifyToken, requireRole } from "../middlewares/auth.middleware";
import { documentUpload } from "../middlewares/upload";
import { handleMulterErrors } from "../middlewares/uploadErrors";
import seller from "../models/SellerProfile";
import { addPetController } from '../controllers/SellerController/addpet.controller'
import { getPetsBySellerController } from '../controllers/SellerController/getpetsbySeller.controller'
import { deletePetController } from "../controllers/SellerController/Deletepet.controller";
import { UpdatePetController } from "../controllers/SellerController/UpdatePet.controller";
import { uploadPet } from "../middlewares/upload";


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

sellerRouter.post(
    "/pet",
    verifyToken,
    requireRole(["seller"]),
    uploadPet.array('images', 3),
    addPetController
);

sellerRouter.get(
    "/pets",
    verifyToken,
    requireRole(["seller"]),
    getPetsBySellerController
);
sellerRouter.delete(
    "/pet/:petId",
    verifyToken,
    requireRole(["seller"]),
    deletePetController
);
sellerRouter.patch(
    "/pet/:petId",
    verifyToken,
    requireRole(["seller"]),
    UpdatePetController
);
