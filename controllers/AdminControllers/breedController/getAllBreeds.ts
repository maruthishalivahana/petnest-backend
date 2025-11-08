import { populateBreeds } from "../../../repos/breedRrpo";
import { Request, Response } from "express";
export const getAllBreedsController = async (req: Request, res: Response) => {
    try {
        const adminid = req.user?.id;
        if (!adminid) {
            return res.status(403).json({
                message: "Access denied"
            })
        }
        const breeds = await populateBreeds();
        if (!breeds || breeds.length === 0) {
            return res.status(404).json({
                message: "No breeds found"
            });
        }
        return res.status(200).json({
            message: "Breeds fetched successfully",
            data: breeds
        });
    } catch (error: any) {
        console.error("Error fetching breeds:", error);
        return res.status(500).json({
            message: "Error fetching breeds",
            error: error.message
        });
    }
}