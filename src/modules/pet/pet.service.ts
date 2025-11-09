import { PetRepository } from "./pet.repo";
import { PetType, PetValidationSchema } from "../../validations/pet.validation";
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

    async addPet(petData: PetType & { userId: string }): Promise<IPet> {
        // Validate pet data
        const parseResult = PetValidationSchema.safeParse(petData);
        if (!parseResult.success) {
            throw parseResult.error;
        }

        // Validate user ID is provided (from JWT token)
        if (!petData.userId) {
            throw new Error("User ID is required");
        }

        // Check if breed exists by name
        const breed = await this.breedRepo.findBreedByName(petData.breedName);
        if (!breed) {
            throw new Error(`Breed "${petData.breedName}" does not exist`);
        }

        console.log("Found breed:", { id: breed._id, name: breed.name, species: breed.species });

        // Get seller profile by userId (from JWT token - secure)
        console.log("Looking for seller with User ID:", petData.userId);

        const sellerProfile = await Seller.findOne({ userId: petData.userId });

        console.log("Seller profile found:", sellerProfile ? {
            id: sellerProfile._id,
            userId: sellerProfile.userId,
            status: sellerProfile.status
        } : null);

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
        const imageUrls = parseResult.data.images;
        if (!imageUrls || imageUrls.length === 0) {
            throw new Error("At least one image is required");
        }

        // Create pet payload with breedId from the breed lookup
        const { breedName: userBreedName, ...restData } = parseResult.data;

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

        console.log("Creating pet with payload:", JSON.stringify(payload, null, 2));

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

    async deletePet(petId: string) {
        const deletedPet = await this.petRepo.deletePetById(petId);

        if (!deletedPet) {
            throw new Error("Pet not found or already deleted");
        }

        return deletedPet;
    }

    async updatePet(petId: string, updateData: Partial<PetType>) {
        const updatedPet = await this.petRepo.updatePet(petId, updateData as any);

        if (!updatedPet) {
            throw new Error("Pet not found");
        }

        return updatedPet;
    }
}
