import { Request, Response } from "express";
import { BreedService } from "./breed.service";
import { BreedSchema } from "../../validations/breed.validation";

const breedService = new BreedService();

export const addBreedController = async (req: Request, res: Response) => {
    try {
        const adminid = req.user?.id;

        if (!adminid) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const validationData = BreedSchema.safeParse(req.body);
        if (!validationData.success) {
            return res.status(400).json({
                message: "Invalid breed data",
                errors: validationData.error.issues[0]
            });
        }

        const newBreed = await breedService.addBreed(validationData.data);

        return res.status(201).json({
            message: "Breed added successfully",
            data: newBreed
        });
    } catch (error: any) {
        console.error("Error adding breed:", error);

        if (error.message === "Breed with this name already exists.") {
            return res.status(409).json({
                message: error.message
            });
        }

        if (error.message === "Species not found.") {
            return res.status(404).json({
                message: error.message
            });
        }

        if (error.message === "Breed data is required") {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Error adding breed",
            error: error.message
        });
    }
};

export const getAllBreedsController = async (req: Request, res: Response) => {
    try {
        const adminid = req.user?.id;

        if (!adminid) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const breeds = await breedService.getAllBreeds();

        return res.status(200).json({
            message: "Breeds fetched successfully",
            data: breeds
        });
    } catch (error: any) {
        console.error("Error fetching breeds:", error);

        if (error.message === "No breeds found") {
            return res.status(404).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Error fetching breeds",
            error: error.message
        });
    }
};

export const getUserBreedController = async (req: Request, res: Response) => {
    try {
        console.log("getUserBreedController called");
        console.log("User:", req.user);

        const buyerId = req.user?.id;

        if (!buyerId) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const breeds = await breedService.getBreedsForUser();

        console.log("Breeds fetched:", breeds?.length || 0);

        return res.status(200).json({
            message: "Breeds fetched successfully",
            data: breeds
        });
    } catch (error: any) {
        console.error("Error fetching breed:", error);

        if (error.message === "No breeds found") {
            return res.status(404).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Error fetching breed",
            error: error.message
        });
    }
};

export const getBreedByIdController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                message: "Breed ID is required"
            });
        }

        const breed = await breedService.getBreedById(id);

        return res.status(200).json({
            message: "Breed retrieved successfully",
            data: breed
        });
    } catch (error: any) {
        console.error("Error getting breed:", error);

        if (error.message === "Breed not found") {
            return res.status(404).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Error getting breed",
            error: error.message
        });
    }
};

export const deleteBreedByIdController = async (req: Request, res: Response) => {
    try {
        const adminid = req.user?.id;

        if (!adminid) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                message: "Breed ID is required"
            });
        }

        const result = await breedService.deleteBreed(id);

        return res.status(200).json(result);
    } catch (error: any) {
        console.error("Error deleting breed:", error);

        if (error.message === "Breed not found or already deleted") {
            return res.status(404).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Error deleting breed",
            error: error.message
        });
    }
};
