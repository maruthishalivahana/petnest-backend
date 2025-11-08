import { Updatepet } from "../../repos/petRepo";
import { getPetById } from "../../repos/petRepo";
import { getSellerByUserId } from "../../repos/sellerRequestRepo";

export const UpdatePetService = async (petId: string, updateData: any, userId: string) => {
    // Validate input data
    if (!updateData || Object.keys(updateData).length === 0) {
        throw new Error("No update data provided");
    }

    // First, get the seller profile from userId (from JWT token)
    const sellerProfile = await getSellerByUserId(userId);

    if (!sellerProfile) {
        throw new Error("Seller profile not found. Please submit a seller verification request first.");
    }

    // Get the pet to verify ownership
    const pet = await getPetById(petId);
    if (!pet) {
        throw new Error("Pet not found");
    }

    // Verify that the pet belongs to this seller (using SellerProfile._id)
    if (pet.sellerId.toString() !== String(sellerProfile._id)) {
        throw new Error("Unauthorized: You can only update your own pets");
    }

    // Sanitize update data - remove sensitive fields that sellers shouldn't control
    if (updateData.price) updateData.price = Number(updateData.price);
    delete updateData.breedId;
    delete updateData.breedName;
    // delete updateData.BreedName;
    delete updateData.sellerId;
    delete updateData.userId; // Also prevent changing userId
    delete updateData.category;
    delete updateData.isVerified;
    delete updateData.status;
    delete updateData.featuredRequest;

    const updatedPet = await Updatepet(petId, updateData);

    if (!updatedPet) {
        throw new Error("Failed to update pet");
    }

    return updatedPet;
}
