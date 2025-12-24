import Pet from "../../database/models/pet.model";
import { IPet } from "../../database/models/pet.model";
import Seller from "../../database/models/seller.model";

export class PetRepository {
    async createPet(petData: Partial<IPet>) {
        try {
            return await Pet.create(petData);
        } catch (error) {
            console.error("Error creating pet:", error);
            throw new Error("Error creating pet: " + (error as Error).message);
        }
    }

    async findPetById(petId: string) {
        try {
            return await Pet.findById(petId);
        } catch (error) {
            console.error("Error fetching pet by ID:", error);
            throw new Error("Error fetching pet by ID: " + (error as Error).message);
        }
    }

    async findPetsBySellerId(sellerId: string) {
        try {
            return await Pet.find({ sellerId: sellerId })
                .sort({ createdAt: -1 })
                .populate('breedId', 'name species');
        } catch (error) {
            console.error("Error fetching pets by seller ID:", error);
            throw new Error("Error fetching pets by seller ID: " + (error as Error).message);
        }
    }

    async findPetsByUserId(userId: string) {
        try {
            const sellerProfile = await Seller.findOne({ userId: userId });

            if (!sellerProfile) {
                return [];
            }

            return await Pet.find({ sellerId: sellerProfile._id })
                .sort({ createdAt: -1 })
                .populate('breedId', 'name species');
        } catch (error) {
            console.error("Error fetching pets by user ID:", error);
            throw new Error("Error fetching pets by user ID: " + (error as Error).message);
        }
    }
    async countPetsByUserId(userId: string) {
        try {
            const sellerProfile = await Seller.findOne({ userId });

            if (!sellerProfile) {
                return 0;
            }

            return await Pet.countDocuments({ sellerId: sellerProfile._id });
        } catch (error) {
            console.error("Error counting pets:", error);
            throw new Error(
                "Error counting pets: " + (error as Error).message
            );
        }
    }


    async updatePetStatus(petId: string, status: string) {
        try {
            return await Pet.findByIdAndUpdate(
                petId,
                { status: status },
                { new: true }
            );
        } catch (error) {
            console.error("Error updating pet status:", error);
            throw new Error("Error updating pet status: " + (error as Error).message);
        }
    }

    async updateVerifiedStatus(petId: string, isVerified: boolean) {
        try {
            return await Pet.findByIdAndUpdate(
                petId,
                { isVerified: isVerified },
                { new: true }
            );
        } catch (error) {
            console.error("Error updating verified status:", error);
            throw new Error("Error updating verified status: " + (error as Error).message);
        }
    }

    async findAllPets() {
        try {
            return await Pet.find({});
        } catch (error) {
            console.error("Error fetching all pets:", error);
            throw new Error("Error fetching all pets: " + (error as Error).message);
        }
    }

    async findNotVerifiedPets() {
        try {
            return await Pet.find({ isVerified: false });
        } catch (error) {
            console.error("Error fetching not verified pets:", error);
            throw new Error("Error fetching not verified pets: " + (error as Error).message);
        }
    }

    async deletePetById(petId: string) {
        try {
            return await Pet.findByIdAndDelete(petId);
        } catch (error) {
            console.error("Error deleting pet by ID:", error);
            throw new Error("Error deleting pet by ID: " + (error as Error).message);
        }
    }

    async updatePet(petId: string, updateData: Partial<IPet>) {
        try {
            return await Pet.findByIdAndUpdate(
                petId,
                updateData,
                { new: true }
            );
        } catch (error) {
            console.error("Error updating pet:", error);
            throw new Error("Error updating pet: " + (error as Error).message);
        }
    }
}
