import { createbreed, getBreedByName } from "../../repos/breedRrpo";
import { BreedType } from "../../validations/breed.validation";
import { findSpeciesByName } from "../../repos/Species.repo";


export const AddBreed = async (body: { breedData: BreedType }) => {
    const { breedData } = body;
    try {
        if (!breedData) {
            throw new Error("Breed data is required");
        }
        const existingBreed = await getBreedByName(breedData.name);
        if (existingBreed) {
            throw new Error("Breed with this name already exists.");
        }

        // getting species name and finding its id
        const species = await findSpeciesByName(breedData.species);
        if (!species) {
            throw new Error("Species not found.");
        }
        breedData.species = species._id as any;
        const newBreed = await createbreed(breedData);
        return newBreed;

    } catch (error: any) {
        console.error("Error adding breed:", error);
        throw new Error("Error adding breed: " + error.message);
    }

}