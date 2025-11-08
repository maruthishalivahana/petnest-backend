import { z } from 'zod';

export const PetValidationSchema = z.object({
    breedName: z.string().min(1, "Breed name is required"),
    name: z.string().min(1),
    gender: z.enum(["male", "female", "unknown"]),
    age: z.string().optional(),
    price: z.preprocess((val) => Number(val), z.number().positive().optional()), // 👈 converts string → number
    currency: z.string().optional(),
    description: z.string().optional(),
    vaccinationInfo: z.string().optional(),
    images: z.array(z.string()).optional(),

    location: z.object({
        city: z.string().min(1),
        state: z.string().optional(),
        pincode: z.string().optional(),
    }),

    // THESE from schema(backend sets them)
    // category
    // status
    // approvedBy
    // approvedAt
});



export type PetType = z.infer<typeof PetValidationSchema>;


export const UpdatePetSchema = z.object({
    name: z.string().optional(),
    gender: z.enum(["male", "female", "unknown"]).optional(),
    age: z.string().optional(),
    price: z.preprocess((v) => v ? Number(v) : undefined, z.number().positive().optional()),
    currency: z.string().optional(),
    description: z.string().optional(),
    vaccinationInfo: z.string().optional(),
    images: z.array(z.string()).optional(),
    location: z.object({
        city: z.string().optional(),
        state: z.string().optional(),
        pincode: z.string().optional()
    }).optional(),
});
export type UpdatePetType = z.infer<typeof UpdatePetSchema>;

