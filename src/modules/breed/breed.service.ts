import { BreedRepository } from "./breed.repo";
import { BreedType } from "../../validations/breed.validation";
import { SpeciesRepository } from "../species/species.repo";

export class BreedService {
    private breedRepo: BreedRepository;
    private speciesRepo: SpeciesRepository;

    constructor() {
        this.breedRepo = new BreedRepository();
        this.speciesRepo = new SpeciesRepository();
    }

    async addBreed(breedData: BreedType) {
        if (!breedData) {
            throw new Error("Breed data is required");
        }

        // Check if breed already exists
        const existingBreed = await this.breedRepo.findBreedByName(breedData.name);
        if (existingBreed) {
            throw new Error("Breed with this name already exists.");
        }

        // Find species by name and get its ID
        const species = await this.speciesRepo.findSpeciesByName(breedData.species);
        if (!species) {
            throw new Error("Species not found.");
        }

        // Replace species name with species ID
        const breedDataWithSpeciesId: any = {
            ...breedData,
            species: species._id
        };

        const newBreed = await this.breedRepo.createBreed(breedDataWithSpeciesId);
        return newBreed;
    }

    async getAllBreeds() {
        const breeds = await this.breedRepo.findAllBreeds();

        if (!breeds || breeds.length === 0) {
            throw new Error("No breeds found");
        }

        return breeds;
    }

    async getBreedsForUser() {
        const breeds = await this.breedRepo.findBreedsFormatted();

        if (!breeds || breeds.length === 0) {
            throw new Error("No breeds found");
        }

        return breeds;
    }

    async getBreedById(breedId: string) {
        const breed = await this.breedRepo.findBreedById(breedId);

        if (!breed) {
            throw new Error("Breed not found");
        }

        return breed;
    }

    async deleteBreed(breedId: string) {
        const deletedBreed = await this.breedRepo.deleteBreedById(breedId);

        if (!deletedBreed) {
            throw new Error("Breed not found or already deleted");
        }

        return {
            message: "Breed deleted successfully",
            breed: deletedBreed
        };
    }
}
