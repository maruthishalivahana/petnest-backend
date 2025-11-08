import { UpdatePetService } from "../../sellerServices/PetService/updatePet"
import { Request, Response } from "express";

export const UpdatePetController = async (req: Request, res: Response) => {
    try {
        const { petId } = req.params;
        const updateData = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(403).json({ message: "Access denied" });
        }

        if (!petId) {
            return res.status(400).json({ message: "Pet ID is required" });
        }

        const updatedPet = await UpdatePetService(petId, updateData, userId);
        res.status(200).json({
            message: "Pet updated successfully",
            data: updatedPet
        });
    } catch (error) {
        console.error("Error updating pet:", error);
        res.status(500).json({
            message: "Error updating pet",
            error: (error as Error).message
        });
    }
}