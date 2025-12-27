import { PetRepository } from "./pet.repo";
import { PetListingType, UpdatePetListingType } from "../../validations/petListing.validation";
import { BreedRepository } from "../breed/breed.repo";
import { IPet } from "../../database/models/pet.model";
import Seller from "../../database/models/seller.model";
import { SellerRepository } from "../seller/seller.repo";

export class PetService {
    private petRepo: PetRepository;
    private breedRepo: BreedRepository;
    private sellerRepo: SellerRepository;

    constructor() {
        this.petRepo = new PetRepository();
        this.breedRepo = new BreedRepository();
        this.sellerRepo = new SellerRepository();
    }

    async addPet(petData: PetListingType & { userId: string }): Promise<IPet> {
        // Validate user ID is provided (from JWT token)
        if (!petData.userId) {
            throw new Error("User ID is required");
        }

        // Check if breed exists by name
        const breed = await this.breedRepo.findBreedByName(petData.breedName);
        if (!breed) {
            throw new Error(`Breed "${petData.breedName}" does not exist`);
        }

        // Get seller profile by userId (from JWT token - secure)
        const sellerProfile = await Seller.findOne({ userId: petData.userId });

        if (!sellerProfile) {
            throw new Error("Seller profile not found. Please submit a seller verification request first.");
        }

        // Check seller verification status
        switch (sellerProfile.status) {
            case "verified":
                break;
            case "pending":
                throw new Error("Your seller account is pending verification. Please wait for admin approval.");
            case "rejected":
                throw new Error("Your seller account has been rejected. Please contact support.");
            case "suspended":
                throw new Error("Your seller account has been suspended. You cannot add pets at this time.");
            default:
                throw new Error("Invalid seller account status. Please contact support.");
        }

        const bannedSeller = await this.sellerRepo.findSellerByUserIdSimple(petData.userId);
        if (bannedSeller?.userId && (bannedSeller.userId as any).isBanned) {
            throw new Error("Your seller account has been banned. You cannot add pets.");
        }

        // Validate images
        const imageUrls = petData.images;
        if (!imageUrls || imageUrls.length === 0) {
            throw new Error("At least one image is required");
        }

        // Create pet payload with breedId from the breed lookup
        const { breedName: userBreedName, ...restData } = petData;

        // Extract species name from populated breed
        const speciesName = (breed.species as any)?.speciesName || String(breed.species);

        const payload: any = {
            ...restData,
            breedId: breed._id,
            breedName: breed.name,
            category: speciesName,
            sellerId: sellerProfile._id,
            isVerified: false
        };

        const newPet = await this.petRepo.createPet(payload);
        return newPet;
    }

    async getPetById(petId: string) {
        const pet = await this.petRepo.findPetById(petId);

        if (!pet) {
            throw new Error("Pet not found");
        }

        return pet;
    }

    async getPetsBySeller(userId: string) {
        const pets = await this.petRepo.findPetsByUserId(userId);
        return pets;
    }

    async countPetsBySeller(userId: string) {
        const count = await this.petRepo.countPetsByUserId(userId);
        return count;
    }

    async getAllPets() {
        return await this.petRepo.findAllPets();
    }

    async getNotVerifiedPets() {
        const notVerifiedPets = await this.petRepo.findNotVerifiedPets();

        if (!notVerifiedPets || notVerifiedPets.length === 0) {
            throw new Error("No unverified pets found");
        }

        return notVerifiedPets;
    }

    async updatePetVerification(petId: string, isVerified: boolean) {
        const verifiedPet = await this.petRepo.updateVerifiedStatus(petId, isVerified);

        if (!verifiedPet) {
            throw new Error("Pet not found");
        }

        return verifiedPet;
    }

    async updatePetStatus(petId: string, status: string) {
        const updatedPet = await this.petRepo.updatePetStatus(petId, status);

        if (!updatedPet) {
            throw new Error("Pet not found");
        }

        return updatedPet;
    }

    async deletePet(petId: string, userId: string) {
        // Find pet and verify ownership
        const pet = await this.petRepo.findPetById(petId);

        if (!pet) {
            throw new Error("Pet not found or already deleted");
        }

        // Get seller profile to verify ownership
        const sellerProfile = await Seller.findOne({ userId: userId });

        if (!sellerProfile) {
            throw new Error("Seller profile not found");
        }

        // Verify the pet belongs to this seller
        if (String(pet.sellerId) !== String(sellerProfile._id)) {
            throw new Error("Access denied - you can only delete your own pets");
        }

        const deletedPet = await this.petRepo.deletePetById(petId);
        return deletedPet;
    }

    async updatePet(petId: string, updateData: Partial<UpdatePetListingType>, userId: string) {
        // Find pet and verify ownership
        const pet = await this.petRepo.findPetById(petId);

        if (!pet) {
            throw new Error("Pet not found");
        }

        // Get seller profile to verify ownership
        const sellerProfile = await Seller.findOne({ userId: userId });

        if (!sellerProfile) {
            throw new Error("Seller profile not found");
        }

        // Verify the pet belongs to this seller
        if (String(pet.sellerId) !== String(sellerProfile._id)) {
            throw new Error("Access denied - you can only update your own pets");
        }

        const updatedPet = await this.petRepo.updatePet(petId, updateData as any);
        return updatedPet;
    }
}
