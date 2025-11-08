import { getPetsByUserIdService } from '../../sellerServices/PetService/petsBySellerId'
import { Request, Response } from 'express'
export const getPetsBySellerController = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(403).json({
                message: "Access denied"
            })
        }
        const pets = await getPetsByUserIdService(userId);
        return res.status(200).json({
            message: "Pets fetched successfully",
            data: pets
        });
    } catch (error: any) {
        console.error("Error fetching pets by seller:", error);
        return res.status(500).json({
            message: "Error fetching pets by seller",
            error: error.message
        });
    }
}