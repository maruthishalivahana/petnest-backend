import pet from '../models/Pet'
import { PetType } from '../validations/addPet.validation';

import seller from '../models/SellerProfile';

// for creating a new pet 
export const createpet = async (Petdata: PetType) => {
    try {
        const newpet = await pet.create(Petdata);
        return newpet;

    } catch (error) {
        console.error("Error creating pet:", error);
        throw new Error("Error creating pet: " + (error as Error).message);

    }

}
// for getting pet by id

export const getPetById = async (petId: string) => {
    try {
        const petExists = await pet.findById(petId);
        return petExists;

    } catch (error) {
        console.error("Error fetching pet by ID:", error);
        throw new Error("Error fetching pet by ID: " + (error as Error).message);

    }
}
// for getting pets by seller id (sellerId is the SellerProfile._id, not userId)
export const getPetsBySellerId = async (sellerId: string) => {
    try {
        const pets = await pet.find({ sellerId: sellerId }).sort({ createdAt: -1 }).populate('breedId', 'name species');
        return pets;

    } catch (error) {
        console.error("Error fetching pets by seller ID:", error);
        throw new Error("Error fetching pets by seller ID: " + (error as Error).message);

    }
}

// for getting pets by userId (finds SellerProfile first, then gets pets)
export const getPetsByUserId = async (userId: string) => {
    try {

        const sellerProfile = await seller.findOne({ userId: userId });

        if (!sellerProfile) {
            return [];
        }

        const pets = await pet.find({ sellerId: sellerProfile._id }).sort({ createdAt: -1 }).populate('breedId', 'name species');
        return pets;

    } catch (error) {
        console.error("Error fetching pets by user ID:", error);
        throw new Error("Error fetching pets by user ID: " + (error as Error).message);

    }
}
// for updating pet status

export const UpdatePetStatus = async (petId: string, status: string) => {
    try {
        const petStatus = await pet.findByIdAndUpdate(
            petId,
            { status: status },
            { new: true }
        )

    } catch (error) {
        console.error("Error updating pet status:", error);
        throw new Error("Error updating pet status: " + (error as Error).message);

    }
}

export const UpdateVerifiedStatus = async (petId: string, isVerified: boolean) => {
    try {
        const verifiedStatus = await pet.findByIdAndUpdate(
            petId,
            { isVerified: isVerified },
            { new: true }
        )

    } catch (error) {
        console.error("Error updating verified status:", error);
        throw new Error("Error updating verified status: " + (error as Error).message);

    }
}

export const getAllpets = async () => {
    try {
        const pets = await pet.find({});
        return pets;

    } catch (error) {
        console.error("Error fetching all pets:", error);
        throw new Error("Error fetching all pets: " + (error as Error).message);

    }
}

export const deletePetById = async (petId: string) => {
    try {
        const deletedPet = await pet.findByIdAndDelete(petId);
        return deletedPet;
    } catch (error) {
        console.error("Error deleting pet by ID:", error);
        throw new Error("Error deleting pet by ID: " + (error as Error).message);
    }
}

export const Updatepet = async (petId: string, updateData: Partial<PetType>) => {
    try {
        const updatedpet = await pet.findByIdAndUpdate(
            petId,
            updateData,
            { new: true }
        );
        return updatedpet;

    } catch (error) {
        console.error("Error updating pet:", error);
        throw new Error("Error updating pet: " + (error as Error).message);
    }
}