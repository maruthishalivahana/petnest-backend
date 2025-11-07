import species from '../models/Species';
import { SpeciesType } from '../validations/Species.validation';
export const addSpecies = async (speciesData: SpeciesType) => {
    try {
        const newSpecies = new species(speciesData);
        return await newSpecies.save();
    } catch (error: any) {
        if (error.code === 11000) {
            throw new Error("Species with this name already exists.");
        }
        console.error("Error adding species:", error);
    }
}


export const findSpeciesByName = async (speciesName: string) => {
    try {
        const speciesExists = await species.findOne({ speciesName });
        return speciesExists;

    } catch (error) {
        console.error("Error finding species by name:", error);
    }
}