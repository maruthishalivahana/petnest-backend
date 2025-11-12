import express from "express";
import { verifyToken, requireRole } from "../shared/middlewares/auth.middleware";
import upload from "../shared/middlewares/upload";
import {
    buyerProfileUpdateController,
    getBuyerProfileByIdController
} from "../modules/buyer";
import { getUserBreedController } from "../modules/breed";
import {
    addToWishlistController,
    getAllPetsController,
    getpetById,
    getWishlistController,
    removefromWishlistController,
    searchPetsController
} from "../modules/buyer/buyer.controller";



export const buyerRouter = express.Router();

// ============= BUYER PROFILE MANAGEMENT =============
// Update buyer profile
buyerRouter.patch(
    '/profile',
    verifyToken,
    requireRole(['buyer']),
    upload.single('profilePic'),
    buyerProfileUpdateController
);

// Get buyer profile by ID
buyerRouter.get(
    '/profile/:buyerId',
    verifyToken,
    requireRole(['buyer']),
    getBuyerProfileByIdController
);

// ============= BREED ACCESS =============
// Get user-friendly breeds (for buyers to browse)
buyerRouter.get(
    '/breeds',
    verifyToken,
    requireRole(['buyer']),
    getUserBreedController
);


// ============= WISHLIST MANAGEMENT =============
// Add pet to wishlist

buyerRouter.get(
    '/wishlist/',
    verifyToken,
    requireRole(['buyer']),
    getWishlistController
)
buyerRouter.post(
    '/wishlist/:petId',
    verifyToken,
    requireRole(['buyer']),
    addToWishlistController
);

buyerRouter.delete(
    '/wishlist/:petId',
    verifyToken,
    requireRole(['buyer']),
    removefromWishlistController
);

// ============= PET BROWSING =============
// Get all pets
buyerRouter.get(
    '/pets',
    verifyToken,
    requireRole(['buyer']),
    getAllPetsController
);

// Search pets 
buyerRouter.get(
    '/pets/search',
    verifyToken,
    requireRole(['buyer']),
    searchPetsController
);

// Get pet by ID
buyerRouter.get(
    '/pets/:petId',
    verifyToken,
    requireRole(['buyer']),
    getpetById
);
