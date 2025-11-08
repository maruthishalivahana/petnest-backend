import { deletePetService } from "../../sellerServices/PetService/deletePet";
import { Request, Response } from "express";
export const deletePetController = async (req: Request, res: Response) => {
    try {
        const sellerId = req.user?.id;
        if (!sellerId) {
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

        const deletedPetName = await deletePetService(petId);
        return res.status(200).json({
            message: `Pet '${deletedPetName}' deleted successfully`
        });

    } catch (error) {

        console.error("deletePetController error:", error);
        return res.status(500).json({
            message: "Oops! Something went wrong!",
            error: (error as Error).message
        });
    }
}