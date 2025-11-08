// Re-export validation types
export type { SpeciesType } from "../../validations/species.validation";

// Additional species-specific types
export interface SpeciesResponse {
    message: string;
    species?: any;
    speciesList?: any[];
}
