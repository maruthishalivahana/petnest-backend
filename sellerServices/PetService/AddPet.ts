import { createpet, getPetById } from "../../repos/petRepo"
import { getBreedByName } from "../../repos/breedRrpo";
import { getSeller, getSellerByUserId } from "../../repos/sellerRequestRepo";
import { PetType, PetValidationSchema } from "../../validations/addPet.validation"
import { IPet } from "../../models/Pet";


export const Addpet = async (petData: PetType & { userId: string }): Promise<IPet> => {
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
    const Breed = await getBreedByName(petData.breedName);
    if (!Breed) {
        throw new Error(`Breed "${petData.breedName}" does not exist`);
    }

    console.log("Found breed:", { id: Breed._id, name: Breed.name, species: Breed.species });

    // Validate seller exists and is verified using userId from JWT token
    console.log("Looking for seller with User ID:", petData.userId);

    // Get seller profile by userId (from JWT token - secure)
    const sellerProfile = await getSellerByUserId(petData.userId);

    console.log("Seller profile found:", sellerProfile ? { id: sellerProfile._id, userId: sellerProfile.userId, status: sellerProfile.status } : null);

    if (!sellerProfile) {
        throw new Error("Seller profile not found. Please submit a seller verification request first.");
    }

    // Check seller verification status
    switch (sellerProfile.status) {
        case "verified":
            // Seller is verified, continue
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

    // Validate images
    const imageUrls = parseResult.data.images;
    if (!imageUrls || imageUrls.length === 0) {
        throw new Error("At least one image is required");
    }

    // Create pet payload with breedId from the breed lookup
    const { breedName: userBreedName, ...restData } = parseResult.data;

    // Extract species name from populated breed
    const speciesName = (Breed.species as any)?.speciesName || String(Breed.species);

    const payload = {
        ...restData,
        breedId: Breed._id,  // Store ObjectId reference
        breedName: Breed.name, // Store breed name for display (from DB, not user input)
        category: speciesName,
        sellerId: sellerProfile._id, // Use the actual seller profile ID
        isVerified: false
    };

    console.log("Creating pet with payload:", JSON.stringify(payload, null, 2));

    const newPet = await createpet(payload as any);
    return newPet;
}

