import { UpdateVerifiedStatus } from "../../repos/petRepo";
import { getAllnotverifyedpets } from "../../repos/adminRepo";

export const UpdatePetStatusService = async (petId: string, isVerified: boolean) => {
    try {


        const verifiedpet = await UpdateVerifiedStatus(petId, isVerified);

        return { success: true };
    } catch (error) {
        console.error("Error updating pet status:", error);
        throw new Error("Error updating pet status: " + (error as Error).message);
    }
}
