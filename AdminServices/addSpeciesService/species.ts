import { SpeciesType } from '../../validations/Species.validation'
import { addSpecies, findSpeciesByName } from '../../repos/Species.repo';

export const AddSpecies = async (body: { speciesData: SpeciesType }) => {
    const { speciesData } = body;
    try {
        if (!speciesData) {
            throw new Error("Species data is required");
        }
        const existingSpecies = await findSpeciesByName(speciesData.speciesName);
        if (existingSpecies) {
            throw new Error("Species with this name already exists.");
        }
        const newSpecies = await addSpecies(speciesData);
        return newSpecies;


    } catch (error: any) {
        throw new Error(error.message || "Error adding species");

    }


}