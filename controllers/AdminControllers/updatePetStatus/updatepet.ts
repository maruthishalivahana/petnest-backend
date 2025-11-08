import { UpdatePetStatusService } from "../../../AdminServices/petServices/UpdatePetStatus";
import { Request, Response } from "express";


export const updatePetStatusController = async (req: Request, res: Response) => {
    try {
        const adminid = req.user?.id;
        const { petId, status } = req.params;
        const isVerified = status === "true";
        if (!petId || isVerified === undefined) {
            return res.status(400).json({
                message: "Pet ID and isVerified status are required"
            });
        }

        if (!adminid) {
            return res.status(403).json({
                message: "Access denied"
            });
        }
        const updatedPet = await UpdatePetStatusService(petId, isVerified);
        return res.status(200).json({
            message: "Pet status updated successfully",
            data: updatedPet
        });

    } catch (error) {
        console.error("Error updating pet status:", error);
        return res.status(500).json({
            message: "Error updating pet status",
            error: (error as Error).message
        });
    }
}