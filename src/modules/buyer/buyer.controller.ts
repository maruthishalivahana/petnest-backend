import { Request, Response } from "express";
import { BuyerService } from "./buyer.service";
import { z } from "zod";
import { BuyerProfileSchema } from "../../validations/buyer.validation";

const buyerService = new BuyerService();

/**
 * Get buyer profile by ID
 */
export const getBuyerProfileByIdController = async (req: Request, res: Response) => {
    console.log("getBuyerProfileByIdController called");
    console.log("Params:", req.params);
    console.log("User:", req.user);

    try {
        const buyerId = req.params.buyerId;
        if (!buyerId) {
            console.log("No buyerId in params");
            return res.status(400).json({
                message: "Buyer ID is required"
            });
        }

        console.log("Fetching buyer profile for ID:", buyerId);
        const user = await buyerService.getBuyerProfileById(buyerId);
        console.log("User found:", user);

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
