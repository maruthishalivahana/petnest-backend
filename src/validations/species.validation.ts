import { z } from "zod";

export const SpeciesSchema = z.object({
    speciesName: z.string().min(1, "Species name is required"),
    scientificName: z.string().min(1, "Scientific name is required"),
    category: z.string().min(1, "Category is required"),
    protectionLevel: z.string().optional(),
    allowedForTrade: z.boolean("Allowed for trade status is required"),
    referenceAct: z.string().optional(),
    notes: z.string().optional(),

})
export type SpeciesType = z.infer<typeof SpeciesSchema>;