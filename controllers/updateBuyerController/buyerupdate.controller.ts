import { Request, Response } from "express";
import updateBuyerProfileService from "../../buyerServices/updateBuyerService/buyerService";
import { z } from "zod";


export const buyerProfileUpdateController = async (req: Request, res: Response) => {
    try {
        const buyerId = req.user?.id
        if (!buyerId) {
            return res.status(403).json({
                message: "Access denied"
            })
        }
        if (!req.body) {
            return res.status(400).json({
                message: "No data provided for update"
            })
        }
        if (!req.file) {

            return res.status(400).json({
                message: "No file uploaded"
            })
        }
        const updateData = req.body;
        const updatedBuyer = await updateBuyerProfileService(buyerId!, updateData, req.file as Express.Multer.File);
        return res.status(200).json({
            message: "Buyer profile updated successfully",
            buyer: updatedBuyer
        })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: "Validation failed",
                errors: error.issues
            });

        }
        return res.status(500).json({
            message: "Oops! Something went wrong!",
            ...(process.env.NODE_ENV === 'development' && {
                error: (error as Error).message
            })
        });

    }
}