
import { findBuyerById } from "../../repos/buyerRepo";

export const getBuyerProfileService = async (buyerId: string) => {
    const user = await findBuyerById(buyerId);
    if (!user) {
        throw new Error("User not found");
    }
    if (user.role !== 'buyer') {
        throw new Error("Access denied");
    }
    return user;
}