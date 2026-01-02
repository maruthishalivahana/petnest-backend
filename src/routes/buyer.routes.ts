import express from "express";
import { verifyToken, requireRole } from "../shared/middlewares/auth.middleware";
import upload from "../shared/middlewares/upload";
import {
    buyerProfileUpdateController,
    getBuyerProfileByIdController
} from "../modules/buyer";
import { getUserBreedController } from "../modules/breed";
import { getFeaturedPetsController } from "../modules/pet";
import {
    addToWishlistController,
    getAllPetsController,
    getpetById,
    getWishlistController,
    removefromWishlistController,
    searchPetsController,
    filterPetsController,
    checkWishlist

} from "../modules/buyer/buyer.controller";



export const buyerRouter = express.Router();

// ============= BUYER PROFILE MANAGEMENT =============
// Get logged-in buyer's profile (SECURE - uses JWT token only)
buyerRouter.get(
    '/profile',
    verifyToken,
    requireRole(['buyer']),
    getBuyerProfileByIdController
);

// Update buyer profile (SECURE - uses JWT token only)
buyerRouter.patch(
    '/profile',
    verifyToken,
    requireRole(['buyer']),
    upload.single('profilePic'),
    buyerProfileUpdateController
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
buyerRouter.get(
    '/wishlist/check/:petId',
    verifyToken,
    requireRole(['buyer']),
    checkWishlist
);

// ============= PET BROWSING =============
// Get featured pets (public-facing, but requires authentication)
buyerRouter.get(
    '/pets/featured',
    verifyToken,
    requireRole(['buyer']),
    getFeaturedPetsController
);

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

// Filter pets
buyerRouter.get(
    '/pets/filter',
    verifyToken,
    requireRole(['buyer']),
    filterPetsController
);

// Get pet by ID
buyerRouter.get(
    '/pets/:petId',
    verifyToken,
    requireRole(['buyer']),
    getpetById
);
