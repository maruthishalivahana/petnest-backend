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

// ============= NEW DUAL-MODE SELLER CONTROLLERS =============

export const enableSellerModeController = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const result = await sellerService.enableSellerMode(userId);

        return res.status(200).json(result);
    } catch (error: any) {
        console.error("Error enabling seller mode:", error);

        return res.status(500).json({
            message: "Failed to enable seller mode",
            error: error.message
        });
    }
};

export const uploadSellerDocumentsController = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        // Get uploaded files from multer/cloudinary
        const files = (req.files as { [fieldname: string]: Express.Multer.File[] }) || {};

        const documents: string[] = [];

        // Extract document URLs from uploaded files
        if (files.idProof?.[0]?.path) {
            documents.push(files.idProof[0].path);
        }
        if (files.certificate?.[0]?.path) {
            documents.push(files.certificate[0].path);
        }
        if (files.shopImage?.[0]?.path) {
            documents.push(files.shopImage[0].path);
        }

        if (documents.length === 0) {
            return res.status(400).json({
                message: "No documents provided"
            });
        }

        const result = await sellerService.uploadSellerDocuments(userId, documents);

        return res.status(200).json(result);
    } catch (error: any) {
        console.error("Error uploading seller documents:", error);

        if (error.message.includes("not enabled")) {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Failed to upload documents",
            error: error.message
        });
    }
};

export const getSellerVerificationStatusController = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const result = await sellerService.getSellerVerificationStatus(userId);

        return res.status(200).json(result);
    } catch (error: any) {
        console.error("Error getting seller verification status:", error);

        return res.status(500).json({
            message: "Failed to get verification status",
            error: error.message
        });
    }
};

export const getSellerAnalyticsController = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const result = await sellerService.getSellerAnalytics(userId);

        return res.status(200).json(result);
    } catch (error: any) {
        console.error("Error getting seller analytics:", error);

        if (error.message.includes("not enabled")) {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Failed to get analytics",
            error: error.message
        });
    }
};

// ============= ADMIN CONTROLLER FOR DUAL-MODE SELLER VERIFICATION =============

export const adminUpdateSellerVerificationController = async (req: Request, res: Response) => {
    try {
        const adminId = req.user?.id;

        if (!adminId) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const { userId } = req.params;
        const { status, notes } = req.body;

        if (!userId) {
            return res.status(400).json({
                message: "User ID is required"
            });
        }

        if (!status || !['pending', 'verified', 'rejected'].includes(status)) {
            return res.status(400).json({
                message: "Valid status is required (pending, verified, rejected)"
            });
        }

        const result = await sellerService.adminUpdateSellerVerification(userId, status, notes);

        return res.status(200).json(result);
    } catch (error: any) {
        console.error("Error updating seller verification:", error);

        if (error.message.includes("not found") || error.message.includes("not enabled")) {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Failed to update seller verification",
            error: error.message
        });
    }
};

export const adminGetAllDualModeSellerRequestsController = async (req: Request, res: Response) => {
    try {
        const adminId = req.user?.id;

        if (!adminId) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const result = await sellerService.getAllDualModeSellers();

        return res.status(200).json(result);
    } catch (error: any) {
        console.error("Error fetching dual-mode sellers:", error);

        return res.status(500).json({
            message: "Failed to fetch dual-mode sellers",
            error: error.message
        });
    }
};
