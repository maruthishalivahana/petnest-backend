import { AddBreed } from '../../AdminServices/BreedServices/AddBreed';
import { Request, Response } from 'express'
import { BreedSchema } from '../../validations/breed.validation';
export const addBreedController = async (req: Request, res: Response) => {
    try {
        const adminid = req.user?.id;
        if (!adminid) {
            return res.status(403).json({
                message: "Access denied"
            })
        }
        const validationData = BreedSchema.safeParse(req.body);
        if (!validationData.success) {
            return res.status(400).json({
                message: "Invalid breed data",
                errors: validationData.error.issues[0]
            });
        }

        const newBreed = await AddBreed({ breedData: validationData.data });
        return res.status(201).json({
            message: "Breed added successfully",
            data: newBreed
        });

    } catch (error: any) {
        console.error("Error adding breed:", error);
        return res.status(500).json({
            message: "Error adding breed",
            error: error.message
        });
    }
}