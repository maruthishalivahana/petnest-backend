// Re-export validation types
export type { BreedType } from "../../validations/breed.validation";

// Additional breed-specific types
export interface BreedResponse {
    message: string;
    breed?: any;
    breeds?: any[];
    data?: any;
}

export interface FormattedBreed {
    _id: any;
    label: string;
    species: string;
}
