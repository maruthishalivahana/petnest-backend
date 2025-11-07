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
        throw new Error("Error adding species");
    }
}
export const findSpeciesByName = async (speciesName: string) => {
    try {
        const speciesExists = await species.findOne({ speciesName });
        return speciesExists;

    } catch (error) {
        console.error("Error finding species by name:", error);
        throw new Error("Error finding species by name");
    }
}

export const getAllSpecies = async () => {
    try {
        const allSpecies = await species.find({});
        return allSpecies;
    } catch (error) {
        console.error("Error getting all species:", error);
        throw new Error("Error getting all species");
    }
}

export const deleteSpeciesById = async (speciesId: string) => {
    try {
        const deletedSpecie = await species.findByIdAndDelete(speciesId);
        return deletedSpecie;
    } catch (error: any) {
        console.error("Error deleting species by id:", error);
        throw new Error("Error deleting species by id: " + error.message);
    }
}