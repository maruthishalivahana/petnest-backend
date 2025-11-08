import { UpdatePetService } from "../../sellerServices/PetService/updatePet"
import { Request, Response } from "express";
import { UpdatePetSchema } from "../../validations/addPet.validation";
import { z } from "zod";

export const UpdatePetController = async (req: Request, res: Response) => {
    try {
        const { petId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(403).json({ message: "Access denied" });
        }

        if (!petId) {
            return res.status(400).json({ message: "Pet ID is required" });
        }

        // Validate request body with Zod
        const validationResult = UpdatePetSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validationResult.error.issues
            });
        }

        const updatedPet = await UpdatePetService(petId, validationResult.data, userId);
        res.status(200).json({
            message: "Pet updated successfully",
            data: updatedPet
        });
    } catch (error) {
        console.error("Error updating pet:", error);

        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: "Validation failed",
                errors: error.issues
            });
        }

        res.status(500).json({
            message: "Error updating pet",
            error: (error as Error).message
        });
    }
}