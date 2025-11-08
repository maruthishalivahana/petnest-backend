import { Request, Response } from "express";
import { SpeciesService } from "./species.service";
import { SpeciesSchema } from "../../validations/species.validation";

const speciesService = new SpeciesService();

export const addSpeciesController = async (req: Request, res: Response) => {
    try {
        const adminid = req.user?.id;

        if (!adminid) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const validationData = SpeciesSchema.safeParse(req.body);
        if (!validationData.success) {
            return res.status(400).json({
                message: "Invalid species data",
                errors: validationData.error.issues[0]
            });
        }

        const newSpecies = await speciesService.addSpecies(validationData.data);

        return res.status(201).json({
            message: "Species added successfully",
            data: newSpecies
        });
    } catch (error: any) {
        console.error("Error adding species:", error);

        if (error.message === "Species with this name already exists.") {
            return res.status(409).json({
                message: error.message
            });
        }

        if (error.message === "Species data is required") {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

export const getAllSpeciesController = async (req: Request, res: Response) => {
    try {
        const adminid = req.user?.id;

        if (!adminid) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const speciesList = await speciesService.getAllSpecies();

        return res.status(200).json({
            message: "Species retrieved successfully",
            data: speciesList
        });
    } catch (error: any) {
        console.error("Error getting all species:", error);

        if (error.message === "No species found") {
            return res.status(404).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Error getting all species",
            error: error.message
        });
    }
};

export const getSpeciesByIdController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                message: "Species ID is required"
            });
        }

        const species = await speciesService.getSpeciesById(id);

        return res.status(200).json({
            message: "Species retrieved successfully",
            data: species
        });
    } catch (error: any) {
        console.error("Error getting species:", error);

        if (error.message === "Species not found") {
            return res.status(404).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Error getting species",
            error: error.message
        });
    }
};

export const deleteSpeciesByIdController = async (req: Request, res: Response) => {
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
                message: "Species ID is required"
            });
        }

        const result = await speciesService.deleteSpecies(id);

        return res.status(200).json(result);
    } catch (error: any) {
        console.error("Error deleting species:", error);

        if (error.message === "Species not found or already deleted") {
            return res.status(404).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Error deleting species",
            error: error.message
        });
    }
};
