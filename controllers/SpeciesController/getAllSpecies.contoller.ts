import { GetAllSpecies } from '../../AdminServices/SpeciesService/getallSpecies'
import { Request, Response } from 'express'

export const getAllSpeciesController = async (req: Request, res: Response) => {
    try {
        const adminid = req.user?.id;
        if (!adminid) {
            return res.status(403).json({
                message: "Access denied"
            })
        }
        const speciesList = await GetAllSpecies();
        return res.status(200).json({
            message: "Species retrieved successfully",
            data: speciesList
        });

    } catch (error) {
        console.error("Error getting all species:", error);
        return res.status(500).json({
            message: "Error getting all species"
        });
    }
}