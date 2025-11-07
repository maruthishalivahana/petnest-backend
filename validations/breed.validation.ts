import { z } from "zod";
export const BreedSchema = z.object({
    name: z.string().min(1, "Breed name is required"),
    species: z.string().min(1, "species is required"),
    category: z.string().min(1, "category is required"),
    origin: z.string().optional(),
    localName: z.string().optional(),
    isNative: z.boolean().optional(),
    legalStatus: z.enum(['Allowed', 'Restricted', 'Protected'], "legalStatus must be either Allowed, Restricted, or Protected"),
    regulationRef: z.string().optional(),
    description: z.string().optional(),

})