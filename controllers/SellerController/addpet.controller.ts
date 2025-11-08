import { Addpet } from "../../sellerServices/PetService/AddPet";
import { Request, Response } from "express";
import { z } from "zod";
export const addPetController = async (req: Request, res: Response) => {

    try {
        const sellerId = req.user?.id;
        if (!sellerId) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const petData = req.body;
        if (!petData) {
            return res.status(400).json({
                message: "No data provided for adding pet"
            });
        }

        const imageUrls = (req.files as Express.Multer.File[]).map(
            (file) => (file as any).path
        );
        const newPet = await Addpet({ ...petData, sellerId, images: imageUrls });

        return res.status(201).json({
            message: "Pet added successfully",
            pet: newPet
        });

    } catch (error) {
        console.error("addPetController error:", error);

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
