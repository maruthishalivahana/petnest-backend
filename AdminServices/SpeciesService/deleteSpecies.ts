import { deleteSpeciesById } from "../../repos/Species.repo";

export const deleteSpecies = async (speciesId: string) => {
    const deletedSpecies = await deleteSpeciesById(speciesId);

    if (!deletedSpecies) {
        throw new Error("Species not found or already deleted");
    }

    return deletedSpecies;
}