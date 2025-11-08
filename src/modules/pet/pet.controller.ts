import { Request, Response } from "express";
import { PetService } from "./pet.service";
import { z } from "zod";

const petService = new PetService();

// Seller Controllers
export const addPetController = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
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

        const newPet = await petService.addPet({ ...petData, userId, images: imageUrls });

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

        const errorMessage = (error as Error).message;

        if (errorMessage.includes("Breed") && errorMessage.includes("does not exist")) {
            return res.status(404).json({ message: errorMessage });
        }

        if (errorMessage.includes("Seller profile not found")) {
            return res.status(404).json({ message: errorMessage });
        }

        if (errorMessage.includes("pending verification") ||
            errorMessage.includes("rejected") ||
            errorMessage.includes("suspended")) {
            return res.status(403).json({ message: errorMessage });
        }

        return res.status(500).json({
            message: "Oops! Something went wrong!",
            error: errorMessage
        });
    }
};

export const getPetsBySellerController = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const pets = await petService.getPetsBySeller(userId);

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
};

export const deletePetController = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
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

        const deletedPet = await petService.deletePet(petId);

        return res.status(200).json({
            message: "Pet deleted successfully",
            petName: deletedPet.name
        });
    } catch (error: any) {
        console.error("Error deleting pet:", error);

        if (error.message === "Pet not found or already deleted") {
            return res.status(404).json({ message: error.message });
        }

        return res.status(500).json({
            message: "Error deleting pet",
            error: error.message
        });
    }
};

export const UpdatePetController = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const { petId } = req.params;
        const updateData = req.body;

        if (!petId) {
            return res.status(400).json({
                message: "Pet ID is required"
            });
        }

        if (!updateData || Object.keys(updateData).length === 0) {
            return res.status(400).json({
                message: "No update data provided"
            });
        }

        const updatedPet = await petService.updatePet(petId, updateData);

        return res.status(200).json({
            message: "Pet updated successfully",
            pet: updatedPet
        });
    } catch (error: any) {
        console.error("Error updating pet:", error);

        if (error.message === "Pet not found") {
            return res.status(404).json({ message: error.message });
        }

        return res.status(500).json({
            message: "Error updating pet",
            error: error.message
        });
    }
};

// Admin Controllers
export const getAllnotVerifiedPetsController = async (req: Request, res: Response) => {
    try {
        const adminId = req.user?.id;

        if (!adminId) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const notVerifiedPets = await petService.getNotVerifiedPets();

        return res.status(200).json({
            message: "Not verified pets fetched successfully",
            data: notVerifiedPets
        });
    } catch (error: any) {
        console.error("Error fetching not verified pets:", error);

        if (error.message === "No unverified pets found") {
            return res.status(404).json({ message: error.message });
        }

        return res.status(500).json({
            message: "Error fetching not verified pets",
            error: error.message
        });
    }
};

export const updatePetStatusController = async (req: Request, res: Response) => {
    try {
        const adminId = req.user?.id;

        if (!adminId) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const { petId, status } = req.params;

        if (!petId || !status) {
            return res.status(400).json({
                message: "Pet ID and status are required"
            });
        }

        const isVerified = status === "verified";
        const updatedPet = await petService.updatePetVerification(petId, isVerified);

        return res.status(200).json({
            message: `Pet ${isVerified ? 'verified' : 'rejected'} successfully`,
            pet: updatedPet
        });
    } catch (error: any) {
        console.error("Error updating pet status:", error);

        if (error.message === "Pet not found") {
            return res.status(404).json({ message: error.message });
        }

        return res.status(500).json({
            message: "Error updating pet status",
            error: error.message
        });
    }
};
