import { Request, Response } from "express";
import { SellerService } from "./seller.service";
import { z } from "zod";
import { SellerRequestDataSchema } from "../../validations/seller.validation";

const sellerService = new SellerService();

// Seller Controllers
export const SellerFromRequestController = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                message: "No data provided for seller request"
            });
        }

        // Validate request body with Zod
        const validationResult = SellerRequestDataSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validationResult.error.issues
            });
        }

        // Get uploaded files from multer
        const files = (req.files as { [fieldname: string]: Express.Multer.File[] }) || {};

        const newSellerRequest = await sellerService.createSellerRequest(
            validationResult.data,
            userId,
            files
        );

        return res.status(201).json({
            message: "Seller request created successfully",
            sellerRequest: newSellerRequest
        });
    } catch (error) {
        console.error("SellerFromRequestController error:", error);

        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: "Validation failed",
                errors: error.issues
            });
        }

        const errorMessage = (error as Error).message;

        if (errorMessage.includes("pending review") ||
            errorMessage.includes("already an approved seller")) {
            return res.status(400).json({
                message: errorMessage
            });
        }

        if (errorMessage.includes("ID proof and certificate are required")) {
            return res.status(400).json({
                message: errorMessage
            });
        }

        return res.status(500).json({
            message: "Oops! Something went wrong!",
            error: errorMessage
        });
    }
};

// Admin Controllers
const paramsSchema = z.object({
    sellerRequestId: z.string(),
    status: z.enum(["pending", "verified", "rejected", "suspended"])
});

const bodySchema = z.object({
    notes: z.string().max(500).optional()
});

export const verifySellerRequestController = async (req: Request, res: Response) => {
    try {
        console.log("verifySellerRequestController called");
        console.log("Params:", req.params);
        console.log("Body:", req.body);

        const adminId = req.user?.id;

        if (!adminId) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const { sellerRequestId, status } = paramsSchema.parse(req.params);
        const { notes } = bodySchema.parse(req.body);

        if (!sellerRequestId) {
            return res.status(400).json({
                message: "Invalid seller request id"
            });
        }

        const verifyResult = await sellerService.verifySellerRequest(
            sellerRequestId,
            status,
            notes
        );

        return res.status(200).json({
            message: `Seller request status updated to ${status}`,
            verifyResult: verifyResult
        });
    } catch (error) {
        console.error("Error verifying seller request:", error);

        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: "Validation failed",
                errors: error.issues
            });
        }

        const errorMessage = (error as Error).message;

        // Business logic errors
        if (
            errorMessage.includes("already verified") ||
            errorMessage.includes("already rejected") ||
            errorMessage.includes("not found") ||
            errorMessage.includes("cannot reject") ||
            errorMessage.includes("cannot set") ||
            errorMessage.includes("Invalid status")
        ) {
            return res.status(400).json({
                message: errorMessage
            });
        }

        return res.status(500).json({
            message: "Failed to verify seller request",
            error: errorMessage
        });
    }
};

export const getAllPendingRequestsController = async (req: Request, res: Response) => {
    try {
        const adminId = req.user?.id;

        if (!adminId) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const pendingRequests = await sellerService.getPendingSellerRequests();

        return res.status(200).json({
            message: "Pending requests fetched successfully",
            total: pendingRequests.length,
            pendingRequests: pendingRequests
        });
    } catch (error) {
        console.error("Error fetching pending requests:", error);

        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: "Validation failed",
                errors: error.issues
            });
        }

        const errorMessage = (error as Error).message;

        if (errorMessage === "No pending seller requests found") {
            return res.status(200).json({
                message: "No pending requests found",
                total: 0,
                pendingRequests: []
            });
        }

        return res.status(500).json({
            message: "Internal server error",
            error: errorMessage
        });
    }
};

export const getAllVerifiedSellersController = async (req: Request, res: Response) => {
    try {
        const adminId = req.user?.id;

        if (!adminId) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const sellers = await sellerService.getAllVerifiedSellers();

        return res.status(200).json({
            message: "Verified sellers fetched successfully",
            total: sellers.length,
            sellers: sellers
        });
    } catch (error: any) {
        console.error("Error fetching verified sellers:", error);

        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

export const getSellerDetailsController = async (req: Request, res: Response) => {
    try {
        const { sellerId } = req.params;

        if (!sellerId) {
            return res.status(400).json({
                message: "Seller ID is required"
            });
        }

        const seller = await sellerService.getSellerDetails(sellerId);

        return res.status(200).json({
            message: "Seller details fetched successfully",
            seller: seller
        });
    } catch (error) {
        console.error("Error fetching seller details:", error);

        const errorMessage = (error as Error).message;

        if (errorMessage === "Seller not found" || errorMessage === "Seller is not verified") {
            return res.status(404).json({
                message: errorMessage
            });
        }

        return res.status(500).json({
            message: "Internal server error",
            error: errorMessage
        });
    }
};

export const getMySellerProfileController = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const seller = await sellerService.getMySellerProfile(userId);

        return res.status(200).json({
            message: "Seller profile fetched successfully",
            seller: seller
        });
    } catch (error) {
        console.error("Error fetching seller profile:", error);

        const errorMessage = (error as Error).message;

        if (errorMessage === "Seller profile not found") {
            return res.status(404).json({
                message: errorMessage
            });
        }

        return res.status(500).json({
            message: "Internal server error",
            error: errorMessage
        });
    }
};

// ✅ CLEAN ARCHITECTURE: All seller operations now work through the Seller model
// Old dual-mode methods removed - seller data lives only in Seller collection
