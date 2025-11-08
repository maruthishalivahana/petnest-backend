// Re-export validation types
export type { PetType } from "../../validations/pet.validation";

// Additional pet-specific types
export interface PetResponse {
    message: string;
    pet?: any;
    pets?: any[];
    data?: any;
}

export type PetStatus = 'active' | 'sold' | 'removed' | 'rejected' | 'featured';
