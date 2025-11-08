import { BuyerRepository } from "./buyer.repo";
import { BuyerProfileSchema } from "../../validations/buyer.validation";
import { BuyerProfileData } from "./buyer.types";

const buyerRepo = new BuyerRepository();

export class BuyerService {
    /**
     * Get buyer profile by ID
     */
    async getBuyerProfileById(buyerId: string) {
        const user = await buyerRepo.findBuyerById(buyerId);

        if (!user) {
            throw new Error("User not found");
        }

        if (user.role !== 'buyer') {
            throw new Error("Access denied");
        }

        return user;
    }

    /**
     * Update buyer profile
     */
    async updateBuyerProfile(
        buyerId: string,
        body: any,
        file?: Express.Multer.File
    ) {
        try {
            // Validate profile data
            const profileData = BuyerProfileSchema.parse(body);

            // Check if buyer exists
            const user = await buyerRepo.findBuyerById(buyerId);
            if (!user) {
                throw new Error("User not found");
            }

            if (user.role !== 'buyer') {
                throw new Error("Access denied");
            }

            // Get profile picture URL (from uploaded file or existing)
            const profilePicUrl = file ? (file as any).path : user.profilePic;

            // Build update object
            const updatedFields: any = {
                name: profileData.name,
                profilePic: profilePicUrl,
            };

            if (profileData.phoneNumber !== undefined) {
                updatedFields.phoneNumber = profileData.phoneNumber;
            }
            if (profileData.bio !== undefined) {
                updatedFields.bio = profileData.bio;
            }
            if (profileData.location !== undefined) {
                updatedFields.location = profileData.location;
            }
            if (profileData.preferences !== undefined) {
                updatedFields.preferences = profileData.preferences;
            }

            // Update buyer profile
            const updatedUser = await buyerRepo.updateBuyerById(buyerId, updatedFields);
            return updatedUser;
        } catch (error) {
            console.error("Error updating buyer profile:", error);
            throw error;
        }
    }
}
