import express from "express";
import { verifyToken, requireRole } from "../middlewares/auth.middleware";
import upload from "../middlewares/upload";

import { buyerProfileUpdateController } from "../controllers/updateBuyerController/buyerupdate.controller";
import { getBuyerProfileByIdController } from "../controllers/getBuyerProfile/getBuyerProfile.controller";
import { getUserBreedController } from "../controllers/AdminControllers/breedController/getUserBreed";

export const buyerRouter = express.Router();

buyerRouter.patch(
    '/profile',
    verifyToken,
    requireRole(['buyer']),
    upload.single('profilePic'),
    buyerProfileUpdateController
);
buyerRouter.get(
    '/profile/:buyerId',
    verifyToken,
    requireRole(['buyer']),
    getBuyerProfileByIdController
);
buyerRouter.get(
    '/breeds',
    verifyToken,
    requireRole(['buyer']),
    getUserBreedController
);


