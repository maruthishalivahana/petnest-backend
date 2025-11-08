import { createSellerFromRequestService } from "../../sellerServices/SellerFormRequestService/sellerFormRequest";
import { Request, Response } from "express";
import { z } from "zod";
import { SellerRequestDataSchema } from "../../validations/sellerRequestData.validation";

export const SellerFromRequestController = async (req: Request, res: Response) => {
    try {
        console.log("SellerFromRequestController - Body:", req.body);
        console.log("SellerFromRequestController - Files:", req.files);

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

        const newSellerRequest = await createSellerFromRequestService(validationResult.data, userId, files);

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
        return res.status(500).json({
            message: "Oops! Something went wrong!",
            error: (error as Error).message
        });
    }
}