import { getPetsBySellerId, getPetsByUserId } from "../../repos/petRepo";

// Use this when you have the SellerProfile ID
export const getPetsBySellerIdService = async (sellerId: string) => {
    const pets = await getPetsBySellerId(sellerId);
    if (!pets || pets.length === 0) {
        throw new Error("No pets found  please list a pet");
    }
    return pets;
}

// Use this when you have the User ID (from JWT token)
export const getPetsByUserIdService = async (userId: string) => {
    const pets = await getPetsByUserId(userId);
    if (!pets || pets.length === 0) {
        throw new Error("No pets found  please list a pet");
    }
    return pets;
}