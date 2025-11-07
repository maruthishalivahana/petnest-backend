import { getAllSpecies } from "../../repos/Species.repo";


export const GetAllSpecies = async () => {
    try {
        const speciesList = await getAllSpecies();
        if (!speciesList || speciesList.length === 0) {
            throw new Error("No species found");
        }
        return speciesList;

    } catch (error) {
        console.error("Error getting all species:", error);
        throw new Error("Error getting all species");
    }
}