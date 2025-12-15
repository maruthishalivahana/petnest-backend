import { Request, Response } from "express";
import { BuyerService } from "./buyer.service";
import { success, z } from "zod";
import { BuyerProfileSchema } from "../../validations/buyer.validation";
import { get } from "http";
import { PetFilter } from "./buyer.types";
import User from "@database/models/user.model";

const buyerService = new BuyerService();

/**
 * Get buyer profile by ID - SECURED VERSION
 * Only returns the logged-in user's profile using JWT token
 */
export const getBuyerProfileByIdController = async (req: Request, res: Response) => {
    try {
        // SECURITY: Get user ID from JWT token, NOT from request params
        const buyerId = req.user?.id;

        if (!buyerId) {
            return res.status(403).json({
                message: "Access denied - authentication required"
            });
        }

        const user = await buyerService.getBuyerProfileById(buyerId);

        return res.status(200).json({
            message: "Buyer profile fetched successfully",
            user: user
        });

    } catch (error) {
        console.error("Get buyer profile error:", error);

        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: "Validation failed",
                errors: error.issues
            });
        }

        const errorMessage = (error as Error).message;

        if (errorMessage === "User not found") {
            return res.status(404).json({
                message: errorMessage
            });
        }

        if (errorMessage === "Access denied") {
            return res.status(403).json({
                message: errorMessage
            });
        }

        return res.status(500).json({
            message: "Oops! Something went wrong",
            error: errorMessage
        });
    }
};

/**
 * Update buyer profile
 */
export const buyerProfileUpdateController = async (req: Request, res: Response) => {
    try {
        const buyerId = req.user?.id;

        if (!buyerId) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                message: "No data provided for update"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: "No file uploaded"
            });
        }

        // Validate request body with Zod
        const validationResult = BuyerProfileSchema.partial().safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validationResult.error.issues
            });
        }

        const updatedBuyer = await buyerService.updateBuyerProfile(
            buyerId,
            validationResult.data,
            req.file as Express.Multer.File
        );

        return res.status(200).json({
            message: "Buyer profile updated successfully",
            buyer: updatedBuyer
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: "Validation failed",
                errors: error.issues
            });
        }

        const errorMessage = (error as Error).message;

        if (errorMessage === "User not found") {
            return res.status(404).json({
                message: errorMessage
            });
        }

        if (errorMessage === "Access denied") {
            return res.status(403).json({
                message: errorMessage
            });
        }

        return res.status(500).json({
            message: "Oops! Something went wrong!",
            ...(process.env.NODE_ENV === 'development' && {
                error: errorMessage
            })
        });
    }
};

/**
 * Add pet to wishlist
 * SECURITY: Uses req.user.id from JWT token ONLY - no params/query/body userId accepted
 * NEW: Uses cart-style single document per user architecture
 */
export const addToWishlistController = async (req: Request, res: Response) => {
    try {
        // SECURITY: Get user ID from JWT token, NOT from request params/query/body
        const userId = req.user?.id;
        const { petId } = req.params;

        if (!userId) {
            return res.status(403).json({ message: "Access denied" });
        }
        if (!petId) {
            return res.status(400).json({ message: "Pet ID is required" });
        }

        // Pass only the authenticated user's ID to service
        const result = await buyerService.addToWishlist(userId, petId);

        return res.status(200).json(result);

    } catch (error) {
        console.error("Add to wishlist error:", error);

        const errorMessage = (error as Error).message;

        if (errorMessage.includes("Pet not found")) {
            return res.status(404).json({ message: errorMessage });
        }

        if (errorMessage.includes("already in wishlist")) {
            return res.status(400).json({ message: errorMessage });
        }

        return res.status(500).json({
            message: "Oops! Something went wrong!",
            ...(process.env.NODE_ENV === 'development' && {
                error: errorMessage
            })
        });
    }
};

/**
 * Get all pets with wishlist status
 * SECURITY: Uses req.user.id from JWT token to determine wishlist status
 * NEW: Uses optimized batch query for wishlist status
 */
export const getAllPetsController = async (req: Request, res: Response) => {
    try {
        // SECURITY: Get user ID from JWT token, NOT from request params/query/body
        const userId = req.user?.id;
        if (!userId) {
            return res.status(403).json({ message: "Access denied" });
        }

        const pets = await buyerService.getAllPets(userId);
        if (!pets || pets.length === 0) {
            return res.status(404).json({
                message: "No pets found"
            });
        }
        return res.status(200).json({
            message: "Pets retrieved successfully",
            pets: pets
        });
    } catch (error) {
        console.error("Get all pets error:", error);
        return res.status(500).json({
            message: "Oops! Something went wrong!",
            ...(process.env.NODE_ENV === 'development' && {
                error: (error as Error).message
            })
        });
    }
};
/**
 * Remove pet from wishlist
 * SECURITY: Uses req.user.id from JWT token ONLY - prevents User X from removing User Y's wishlist items
 * NEW: Uses cart-style architecture with $pull operator
 */
export const removefromWishlistController = async (req: Request, res: Response) => {
    try {
        // SECURITY: Get user ID from JWT token, NOT from request params/query/body
        const userId = req.user?.id;
        const petId = req.params.petId;

        if (!userId) {
            return res.status(403).json({ message: "Access denied" });
        }
        if (!petId) {
            return res.status(400).json({ message: "Pet ID is required" });
        }

        // Pass only the authenticated user's ID to service
        const result = await buyerService.removeFromWishlist(userId, petId);

        return res.status(200).json(result);

    } catch (error) {
        console.error("Remove from wishlist error:", error);
        const errorMessage = (error as Error).message;

        if (errorMessage.includes("not found in wishlist")) {
            return res.status(404).json({ message: errorMessage });
        }

        if (errorMessage.includes("Pet not found")) {
            return res.status(404).json({ message: errorMessage });
        }

        return res.status(500).json({
            message: "Oops! Something went wrong!",
            ...(process.env.NODE_ENV === 'development' && {
                error: errorMessage
            })
        });
    }
}

/**
 * Get wishlist for logged-in user
 * SECURITY: Uses req.user.id from JWT token ONLY - returns only the authenticated user's wishlist
 * NEW: Returns structured response with items array and count
 */
export const getWishlistController = async (req: Request, res: Response) => {
    try {
        // SECURITY: Get user ID from JWT token, NOT from request params/query/body
        const userId = req.user?.id;
        if (!userId) {
            return res.status(403).json({ message: "Access denied" });
        }

        // Fetch only the authenticated user's wishlist
        const result = await buyerService.getWishlist(userId);

        return res.status(200).json({
            message: "Wishlist retrieved successfully",
            ...result
        });

    } catch (error) {
        console.error("Get wishlist error:", error);
        const errorMessage = (error as Error).message;
        return res.status(500).json({
            message: "Oops! Something went wrong!",
            ...(process.env.NODE_ENV === 'development' && {
                error: errorMessage
            })
        });
    }
}

/**
 * Get pet by ID with wishlist status
 * SECURITY: Uses req.user.id from JWT token to determine wishlist status
 * NEW: Uses fast indexed wishlist check
 */
export const getpetById = async (req: Request, res: Response) => {
    try {
        // SECURITY: Get user ID from JWT token, NOT from request params/query/body
        const userId = req.user?.id;
        if (!userId) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const { petId } = req.params;
        if (!petId) {
            return res.status(400).json({
                message: "Pet ID is required"
            });
        }

        const pet = await buyerService.getByIdPets(petId, userId);

        if (!pet) {
            return res.status(404).json({
                message: "Pet not found"
            });
        }

        return res.status(200).json({
            message: "Pet retrieved successfully",
            pet: pet
        });

    } catch (error: any) {
        console.error("Get pet by ID error:", error);
        const errorMessage = (error as Error).message;

        if (errorMessage === "Pet not found") {
            return res.status(404).json({
                message: errorMessage
            });
        }

        return res.status(500).json({
            message: "Oops! Something went wrong!",
            ...(process.env.NODE_ENV === 'development' && {
                error: errorMessage
            })
        });
    }
};

/**
 * Search pets with wishlist status
 * SECURITY: Uses req.user.id from JWT token to determine wishlist status
 * NEW: Uses optimized batch query for wishlist status
 */
export const searchPetsController = async (req: Request, res: Response) => {
    try {
        // SECURITY: Get user ID from JWT token, NOT from request params/query/body
        const userId = req.user?.id;
        if (!userId) {
            return res.status(403).json({ message: "Access denied" });
        }

        const { keyword } = req.query;
        if (keyword && typeof keyword !== 'string') {
            return res.status(400).json({ message: "Keyword must be a string" });
        }

        const pets = await buyerService.searchPets(keyword, userId);

        return res.status(200).json({
            success: true,
            message: pets.length > 0 ? "Pets retrieved successfully" : "No pets found matching your search",
            count: pets.length,
            pets: pets
        });

    } catch (error) {
        console.error("Search pets error:", error);
        const errorMessage = (error as Error).message;
        return res.status(500).json({
            message: "Oops! Something went wrong!",
            ...(process.env.NODE_ENV === 'development' && {
                error: errorMessage
            })
        });
    }
}

/**
 * Filter pets with wishlist status
 * SECURITY: Uses req.user.id from JWT token to determine wishlist status
 * NEW: Uses optimized batch query for wishlist status
 */
export const filterPetsController = async (req: Request, res: Response) => {
    try {
        // SECURITY: Get user ID from JWT token, NOT from request params/query/body
        const userId = req.user?.id;
        if (!userId) {
            return res.status(403).json({ message: "Access denied" });
        }

        const filters = req.query as PetFilter;
        const pets = await buyerService.filterPets(filters, userId);

        return res.status(200).json({
            success: true,
            message: pets.length > 0 ? "Pets retrieved successfully" : "No pets found matching your filters",
            count: pets.length,
            pets: pets
        });
    } catch (error) {
        console.error("Filter pets error:", error);
        const errorMessage = (error as Error).message;
        return res.status(500).json({
            message: "Oops! Something went wrong!",
            ...(process.env.NODE_ENV === 'development' && {
                error: errorMessage
            })
        });
    }
}

/**
 * Check if a specific pet is in the logged-in user's wishlist
 * SECURITY: Uses req.user.id from JWT token ONLY - prevents User X from checking User Y's wishlist
 * NEW: Uses fast compound indexed query
 */
export const checkWishlist = async (req: Request, res: Response) => {
    try {
        // SECURITY: Get user ID from JWT token, NOT from request params/query/body
        const userId = req.user?.id;
        const { petId } = req.params;

        if (!userId) {
            return res.status(403).json({
                message: "Access denied",
                isWishlisted: false
            });
        }

        if (!petId) {
            return res.status(400).json({
                message: "Pet ID is required",
                isWishlisted: false
            });
        }

        // SECURITY: Use service layer which queries Wishlist.findOne({ user: userId, 'items.pet': petId })
        // This ensures we ONLY check the authenticated user's wishlist
        const isWishlisted = await buyerService.checkWishlist(userId, petId);

        return res.status(200).json({
            isWishlisted
        });

    } catch (error) {
        console.error("Check wishlist error:", error);
        return res.status(500).json({
            message: "Oops! Something went wrong!",
            isWishlisted: false,
            ...(process.env.NODE_ENV === 'development' && {
                error: (error as Error).message
            })
        });
    }
};