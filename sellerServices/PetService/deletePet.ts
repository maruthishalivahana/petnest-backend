import { deletePetById } from "../../repos/petRepo";
export const deletePetService = async (petId: string) => {
    const deletedPet = await deletePetById(petId);
    if (!deletedPet) {
        throw new Error("Pet not found or already deleted");
    }
    return deletedPet.name;
}