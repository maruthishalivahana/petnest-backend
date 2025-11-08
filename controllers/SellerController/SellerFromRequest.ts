import { createSellerFromRequestService } from "../../sellerServices/SellerFormRequestService/sellerFormRequest";
import { Request, Response } from "express";
import { z } from "zod";

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

        const requestData = req.body;
        if (!requestData) {
            return res.status(400).json({
                message: "No data provided for seller request"
            });
        }

        // Get uploaded files from multer
        const files = (req.files as { [fieldname: string]: Express.Multer.File[] }) || {};

        const newSellerRequest = await createSellerFromRequestService(requestData, userId, files);

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