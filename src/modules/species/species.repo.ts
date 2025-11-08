import Species from "../../database/models/species.model";
import { ISpecies } from "../../database/models/species.model";

export class SpeciesRepository {
    async createSpecies(speciesData: Partial<ISpecies>) {
        try {
            const newSpecies = new Species(speciesData);
            return await newSpecies.save();
        } catch (error: any) {
            if (error.code === 11000) {
                throw new Error("Species with this name already exists.");
            }
            console.error("Error adding species:", error);
            throw new Error("Error adding species");
        }
    }

    async findSpeciesByName(speciesName: string) {
        try {
            return await Species.findOne({ speciesName });
        } catch (error) {
            console.error("Error finding species by name:", error);
            throw new Error("Error finding species by name");
        }
    }

    async findAllSpecies() {
        try {
            return await Species.find({});
        } catch (error) {
            console.error("Error getting all species:", error);
            throw new Error("Error getting all species");
        }
    }

    async findSpeciesById(speciesId: string) {
        try {
            return await Species.findById(speciesId);
        } catch (error) {
            console.error("Error finding species by id:", error);
            throw new Error("Error finding species by id");
        }
    }

    async deleteSpeciesById(speciesId: string) {
        try {
            return await Species.findByIdAndDelete(speciesId);
        } catch (error: any) {
            console.error("Error deleting species by id:", error);
            throw new Error("Error deleting species by id: " + error.message);
        }
    }
}
