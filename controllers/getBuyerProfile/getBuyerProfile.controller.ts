import { Request, Response } from "express";
import { getBuyerProfileService } from "../../buyerServices/getuserService/GetBuyerService";
import { z } from "zod";

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
        const user = await getBuyerProfileService(buyerId);
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

        return res.status(500).json({
            message: "Oops! Something went wrong",
            error: (error as Error).message
        });
    }
}