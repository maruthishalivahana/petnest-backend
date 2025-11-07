import { AddSpecies } from '../../AdminServices/SpeciesService/species'
import { Request, Response } from 'express'
import { SpeciesSchema } from '../../validations/Species.validation';
export const addSpeciesController = async (req: Request, res: Response) => {
    try {
        const adminid = req.user?.id;
        const validationData = SpeciesSchema.safeParse(req.body);
        if (!validationData.success) {
            return res.status(400).json({
                message: "Invalid species data",
                errors: validationData.error.issues[0]
            });
        }

        if (!adminid) {
            return res.status(403).json({
                message: "Access denied"
            })
        }
        const Speciesdata = req.body;
        if (!Speciesdata) {
            return res.status(400).json({
                message: "Species data is required"
            })
        }
        const newSpecies = await AddSpecies({ speciesData: Speciesdata });
        return res.status(201).json({
            message: "species added successfully",
            data: newSpecies
        });

    } catch (error: any) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        })

    }
}