import Breed from "../models/Breed";
import { BreedType } from "../validations/breed.validation";
export const createbreed = async (breedData: BreedType) => {
    try {
        const newBreed = new Breed(breedData);
        return await newBreed.save();


    } catch (error: any) {
        console.error("Error creating breed:", error);
        throw new Error("Error creating breed: " + error.message);
    }
}

export const getBreedByName = async (breedName: string) => {
    try {
        const breedEExists = await Breed.findOne({ name: breedName }).populate('species');
        return breedEExists;

    } catch (error: any) {
        console.error("Error fetching breed by name:", error);
        throw new Error("Error fetching breed by name: " + error.message);
    }
}


export const populateBreeds = async () => {
    try {
        const breeds = await Breed.find().populate('species', "speciesName scientificName category allowedForTrade");
        return breeds;

    } catch (error: any) {
        console.error("Error populating breeds:", error);
        throw new Error("Error populating breeds: " + error.message);
    }
}

export const getBreed = async () => {
    try {
        const breed = await Breed.find({}).populate('species', "speciesName");

        const formatted = breed.map(b => ({
            _id: b._id,
            label: b.name,
            species: (b.species as any)?.speciesName || ""
        }));
        return formatted;
    } catch (error: any) {
        console.error("Error fetching breeds ", error);
        throw new Error("Error fetching breeds  : " + error.message);
    }
}

export const getBreedById = async (breedId: string) => {
    try {
        const breed = await Breed.findById(breedId).populate('species');
        return breed;
    } catch (error: any) {
        console.error("Error fetching breed by ID:", error);
        throw new Error("Error fetching breed by ID: " + error.message);
    }
}

export const deleteBreedById = async (breedId: string) => {
    try {
        const deletedBreed = await Breed.findByIdAndDelete(breedId);
        return deletedBreed;
    } catch (error: any) {
        console.error("Error deleting breed by id:", error);
        throw new Error("Error deleting breed by id: " + error.message);
    }
}