export interface BuyerProfileData {
    name: string;
    phoneNumber?: string;
    bio?: string;
    location?: string;
    preferences?: string[];
}

export interface BuyerResponse {
    _id: string;
    name: string;
    email: string;
    role: string;
    profilePic?: string;
    phoneNumber?: string;
    bio?: string;
    location?: string;
    preferences?: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface PetFilter {
    gender?: string;
    age?: string;
    city?: string;
    state?: string;
    minPrice?: number;
    maxPrice?: number;
    breedName?: string;
}
