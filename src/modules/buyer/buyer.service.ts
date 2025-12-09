import { BuyerRepository } from "./buyer.repo";
import { BuyerProfileSchema } from "../../validations/buyer.validation";
import { BuyerProfileData, PetFilter } from "./buyer.types";

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

    /**
     * ============= NEW CART-STYLE WISHLIST SERVICE METHODS =============
     * Simplified logic using single document per user architecture
     */

    /**
     * Add pet to user's wishlist
     * SECURITY: Only allows logged-in user to add to THEIR OWN wishlist
     * Uses $addToSet to prevent duplicates automatically
     */
    async addToWishlist(userId: string, petId: string) {
        try {
            // Verify pet exists
            const pet = await buyerRepo.findById(petId);
            if (!pet) {
                throw new Error("Pet not found");
            }

            // Check if already in wishlist (fast indexed query)
            const alreadyWishlisted = await buyerRepo.isWishlisted(userId, petId);
            if (alreadyWishlisted) {
                throw new Error("Pet is already in wishlist");
            }

            // Add to wishlist (creates document if doesn't exist)
            const result = await buyerRepo.addToWishlist(userId, petId);

            return {
                message: "Pet added to wishlist successfully",
                wishlist: result
            };

        } catch (error) {
            const errorMessage = (error as Error).message;
            console.error("Error adding to wishlist:", errorMessage);
            throw error;
        }
    }

    /**
     * Remove pet from user's wishlist
     * SECURITY: Only allows logged-in user to remove from THEIR OWN wishlist
     */
    async removeFromWishlist(userId: string, petId: string) {
        try {
            // Verify pet exists
            const pet = await buyerRepo.findById(petId);
            if (!pet) {
                throw new Error("Pet not found");
            }

            // Check if pet is in wishlist
            const isInWishlist = await buyerRepo.isWishlisted(userId, petId);
            if (!isInWishlist) {
                throw new Error("Pet not found in wishlist");
            }

            // Remove from wishlist
            await buyerRepo.removeFromWishlist(userId, petId);

            return {
                message: "Pet removed from wishlist successfully"
            };

        } catch (error) {
            const errorMessage = (error as Error).message;
            console.error("Error removing from wishlist:", errorMessage);
            throw error;
        }
    }

    /**
     * Get user's complete wishlist
     * SECURITY: Only returns wishlist items belonging to the authenticated user
     */
    async getWishlist(userId: string) {
        try {
            const wishlist = await buyerRepo.getWishlist(userId);

            if (!wishlist || !wishlist.items || wishlist.items.length === 0) {
                return {
                    items: [],
                    count: 0
                };
            }

            return {
                items: wishlist.items,
                count: wishlist.items.length
            };
        } catch (error) {
            console.error("Error fetching wishlist:", error);
            throw new Error("Error retrieving wishlist");
        }
    }

    /**
     * Check if a specific pet is in user's wishlist
     * SECURITY: Only checks the authenticated user's wishlist
     * Fast compound index query
     */
    async checkWishlist(userId: string, petId: string): Promise<boolean> {
        try {
            return await buyerRepo.isWishlisted(userId, petId);
        } catch (error) {
            console.error("Error checking wishlist:", error);
            return false; // Return false on error instead of throwing
        }
    }

    /**
     * Get all pets with wishlist status
     * SECURITY: Wishlist status based on logged-in user's ID only
     * Uses optimized batch query for performance
     */
    async getAllPets(userId: string) {
        try {
            const pets = await buyerRepo.findAllPets();

            // Get wishlist pet IDs for the authenticated user only (fast query)
            const wishlistedPetIds = await buyerRepo.getWishlistPetIds(userId);

            // Add wishlist status to each pet
            const petsWithWishlistStatus = pets.map((pet: any) => ({
                ...pet.toObject(),
                isWishlisted: wishlistedPetIds.includes(String(pet._id))
            }));

            return petsWithWishlistStatus;
        } catch (error) {
            console.error("Error retrieving pets:", error);
            throw new Error("Error retrieving pets");
        }
    }

    /**
     * Get pet by ID with wishlist status
     * SECURITY: Wishlist status based on logged-in user's ID only
     */
    async getByIdPets(petId: string, userId: string) {
        try {
            const pet = await buyerRepo.findById(petId);
            if (!pet) throw new Error("Pet not found");

            // Check if pet is in the authenticated user's wishlist (fast indexed query)
            const isWishlisted = await buyerRepo.isWishlisted(userId, petId);

            return {
                ...pet.toObject(),
                isWishlisted
            };
        } catch (error: any) {
            console.error("Error getting pet:", error);
            throw new Error("Error getting pet: " + error.message);
        }
    }

    /**
     * Search pets with wishlist status
     * SECURITY: Wishlist status based on logged-in user's ID only
     */
    async searchPets(keyword?: string, userId?: string) {
        const pets = await buyerRepo.searchPets(keyword);

        if (!userId || !pets || pets.length === 0) {
            return pets || [];
        }

        // Get wishlist pet IDs for the authenticated user only
        const wishlistedPetIds = await buyerRepo.getWishlistPetIds(userId);

        const petsWithWishlistStatus = pets.map((pet: any) => ({
            ...pet.toObject(),
            isWishlisted: wishlistedPetIds.includes(String(pet._id))
        }));

        return petsWithWishlistStatus;
    }

    /**
     * Filter pets with wishlist status
     * SECURITY: Wishlist status based on logged-in user's ID only
     */
    async filterPets(filters: PetFilter, userId: string) {
        const pets = await buyerRepo.filterpets(filters);
        if (!pets || pets.length === 0) {
            throw new Error("No pets found matching the filter criteria");
        }

        // Get wishlist pet IDs for the authenticated user only
        const wishlistedPetIds = await buyerRepo.getWishlistPetIds(userId);

        const petsWithWishlistStatus = pets.map((pet: any) => ({
            ...pet.toObject(),
            isWishlisted: wishlistedPetIds.includes(String(pet._id))
        }));

        return petsWithWishlistStatus;
    }
}

