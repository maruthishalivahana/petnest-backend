import Breed from "../../database/models/breed.model";
import { IBreed } from "../../database/models/breed.model";

export class BreedRepository {
    async createBreed(breedData: Partial<IBreed>) {
        try {
            const newBreed = new Breed(breedData);
            return await newBreed.save();
        } catch (error: any) {
            console.error("Error creating breed:", error);
            throw new Error("Error creating breed: " + error.message);
        }
    }

    async findBreedByName(breedName: string) {
        try {
            return await Breed.findOne({ name: breedName }).populate('species');
        } catch (error: any) {
            console.error("Error fetching breed by name:", error);
            throw new Error("Error fetching breed by name: " + error.message);
        }
    }

    async findAllBreeds() {
        try {
            // Only return the name to keep the payload small for listing
            return await Breed.find().select('name').sort({ name: 1 }).lean();
        } catch (error: any) {
            console.error("Error populating breeds:", error);
            throw new Error("Error populating breeds: " + error.message);
        }
    }

    async findBreedsFormatted() {
        try {
            const breeds = await Breed.find({}).populate('species', "speciesName");

            return breeds.map(b => ({
                _id: b._id,
                label: b.name,
                species: (b.species as any)?.speciesName || ""
            }));
        } catch (error: any) {
            console.error("Error fetching breeds:", error);
            throw new Error("Error fetching breeds: " + error.message);
        }
    }

    async findBreedById(breedId: string) {
        try {
            return await Breed.findById(breedId).populate('species');
        } catch (error: any) {
            console.error("Error fetching breed by ID:", error);
            throw new Error("Error fetching breed by ID: " + error.message);
        }
    }

    async deleteBreedById(breedId: string) {
        try {
            return await Breed.findByIdAndDelete(breedId);
        } catch (error: any) {
            console.error("Error deleting breed by id:", error);
            throw new Error("Error deleting breed by id: " + error.message);
        }
    }
}
