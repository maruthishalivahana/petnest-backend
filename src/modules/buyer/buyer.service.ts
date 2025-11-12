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

    async addToWishlist(buyerId: string, petId: string) {
        try {
            const Pet = await buyerRepo.findById(petId);
            if (!Pet) {
                throw new Error("Pet not found");
            }
            const existingItem = await buyerRepo.findOne(buyerId, petId);
            if (existingItem) {
                throw new Error("Pet is already in wishlist");
            }
            const wishlistItem = await buyerRepo.addToWishlist(buyerId, petId);
            return wishlistItem;

        } catch (error) {
            const errorMessage = (error as Error).message;
            console.error("Error adding to wishlist:", errorMessage);
            throw new Error("Error adding to wishlist: " + errorMessage);

        }
    }

    async getAllPets() {
        try {
            const pets = await buyerRepo.findAllPets();
            return pets;
        } catch (error) {
            console.error("Error retrieving pets:", error);
            throw new Error("Error retrieving pets");
        }
    }

    async getByIdPets(petId: string) {
        try {
            const pets = await buyerRepo.findById(petId)
            if (!pets) throw new Error("pet not found");
            return pets

        } catch (error: any) {
            console.error("somthing went wrong")
            throw new Error("error getting pet", error)

        }
    }
    async removeFromWishlist(buyerId: string, petId: string) {
        try {
            const removed = await buyerRepo.findOne(buyerId, petId);
            const Pet = await buyerRepo.findById(petId);
            if (!removed) {
                throw new Error("Pet not found in wishlist or removed already");
            }

            if (!Pet) {
                throw new Error("Pet not found");
            }
            await buyerRepo.removeFromWishlist(buyerId, petId);
            return;
        } catch (error) {
            const errorMessage = (error as Error).message;
            console.error("Error removing from wishlist:", errorMessage);
            throw new Error("Error removing from wishlist: " + errorMessage);
        }
    }

    async getWishlist(buyerId: string) {
        const wishlist = await buyerRepo.getWishList(buyerId);
        if (!wishlist || wishlist.length === 0) {
            throw new Error("Wishlist not found");
        }


        const firstBuyerId = (wishlist[0] as any).buyerId;
        if (firstBuyerId && String(firstBuyerId) !== buyerId) {
            throw new Error("Access denied");
        }

        return wishlist;
    }

    async searchPets(keyword?: string) {
        const pets = await buyerRepo.searchPets(keyword);
        // Return empty array if no pets found (not an error condition)
        return pets || [];
    }
}
