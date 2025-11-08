import { SpeciesRepository } from "./species.repo";
import { SpeciesType } from "../../validations/species.validation";

export class SpeciesService {
    private speciesRepo: SpeciesRepository;

    constructor() {
        this.speciesRepo = new SpeciesRepository();
    }

    async addSpecies(speciesData: SpeciesType) {
        if (!speciesData) {
            throw new Error("Species data is required");
        }

        // Check if species already exists
        const existingSpecies = await this.speciesRepo.findSpeciesByName(speciesData.speciesName);
        if (existingSpecies) {
            throw new Error("Species with this name already exists.");
        }

        const newSpecies = await this.speciesRepo.createSpecies(speciesData);
        return newSpecies;
    }

    async getAllSpecies() {
        const speciesList = await this.speciesRepo.findAllSpecies();

        if (!speciesList || speciesList.length === 0) {
            throw new Error("No species found");
        }

        return speciesList;
    }

    async getSpeciesById(speciesId: string) {
        const species = await this.speciesRepo.findSpeciesById(speciesId);

        if (!species) {
            throw new Error("Species not found");
        }

        return species;
    }

    async deleteSpecies(speciesId: string) {
        const deletedSpecies = await this.speciesRepo.deleteSpeciesById(speciesId);

        if (!deletedSpecies) {
            throw new Error("Species not found or already deleted");
        }

        return {
            message: "Species deleted successfully",
            species: deletedSpecies
        };
    }
}
