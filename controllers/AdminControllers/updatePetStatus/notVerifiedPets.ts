import { getAllnotVerifiedPetsService } from "../../../AdminServices/petServices/notVerifiedPets";
import { Request, Response } from "express";

export const getAllnotVerifiedPetsController = async (req: Request, res: Response) => {
    try {
        const adminId = req.user?.id;
        if (!adminId) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const notVerifiedPets = await getAllnotVerifiedPetsService();
        return res.status(200).json({
            message: "Unverified pets retrieved successfully",
            data: notVerifiedPets
        });

    } catch (error) {
        console.error("Error retrieving unverified pets:", error);
        return res.status(500).json({
            message: "Error retrieving unverified pets",
            error: (error as Error).message
        });
    }
}