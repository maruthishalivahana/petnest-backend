import { deleteSpecies } from "../../AdminServices/SpeciesService/deleteSpecies";
import { Request, Response } from "express";


export const deleteSpeciesByIdController = async (req: Request, res: Response) => {
    try {
        console.log("deleteSpeciesByIdController called");
        console.log("Params:", req.params);
        console.log("User:", req.user);

        const adminid = req.user?.id;
        if (!adminid) {
            return res.status(403).json({
                message: "Access denied"
            })
        }

        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                message: "Species ID is required"
            })
        }

        const deletedSpecies = await deleteSpecies(id);

        return res.status(200).json({
            message: "Species deleted successfully",
            species: deletedSpecies
        });

    } catch (error: any) {
        console.error("Error deleting species:", error);

        // Handle specific error messages
        if (error.message.includes("not found")) {
            return res.status(404).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Error deleting species",
            error: error.message
        });
    }
}