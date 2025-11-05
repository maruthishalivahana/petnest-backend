import express from "express";
import { UpdateBuyerProfile } from "../controllers/buyerServices/buyer.profile.contoller";
import { verifyToken, requireRole } from "../middlewares/auth.middleware";
import upload from "../middlewares/upload";


export const buyerRouter = express.Router();

buyerRouter.patch(
    '/profile',
    verifyToken,
    requireRole(['buyer']),
    upload.single('profilePic'),
    UpdateBuyerProfile
);

