

import { string, z } from 'zod'

// Schema for seller request when creating (without userId and documents in body)
export const SellerRequestDataSchema = z.object({
    brandName: z.string().min(1, "brand name is required"),
    logoUrl: z.string().url().optional(),
    bio: z.string().max(500).optional(),
    whatsappNumber: z.string().optional(),
    location: z.object({
        city: z.string().optional(),
        state: z.string().optional(),
        pincode: z.string().optional(),
    }).optional(),
});

// Full schema for storing in database (with all fields)
export const SellerRequestFullSchema = z.object({
    userId: z.string().min(1, "user id is required"),
    brandName: z.string().min(1, "brand name is required"),
    logoUrl: z.string().url().optional(),
    bio: z.string().max(500).optional(),
    whatsappNumber: z.string().optional(),
    location: z.object({
        city: z.string().optional(),
        state: z.string().optional(),
        pincode: z.string().optional(),
    }).optional(),
    documents: z.object({
        idProof: z.string().min(1, "id proof is required"),
        certificate: z.string().min(1, "certificate is required"),
        shopImage: z.string().optional(),
    }),
    verificationNotes: z.string().optional(),
    verificationDate: z.string().optional(),
});

export type SellerRequestData = z.infer<typeof SellerRequestDataSchema>;
export type SellerRequestFullData = z.infer<typeof SellerRequestFullSchema>;

