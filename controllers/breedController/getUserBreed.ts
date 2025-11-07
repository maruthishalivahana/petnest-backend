import { getBreed } from "../../repos/breedRrpo";
import { Request, Response } from "express";

export const getUserBreedController = async (req: Request, res: Response) => {
    try {
        console.log("getUserBreedController called");
        console.log("User:", req.user);

        const buyerId = req.user?.id;
        if (!buyerId) {
            return res.status(403).json({
                message: "Access denied"
            })
        }

        const breed = await getBreed();
        console.log("Breeds fetched:", breed?.length || 0);

        if (!breed || breed.length === 0) {
            return res.status(404).json({
                message: "No breeds found"
            });
        }

        return res.status(200).json({
            message: "Breeds fetched successfully",
            data: breed
        });
    } catch (error: any) {
        console.error("Error fetching breed:", error);
        return res.status(500).json({
            message: "Error fetching breed",
            error: error.message
        });
    }
}