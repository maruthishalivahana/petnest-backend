
import { z } from 'zod'

export const SellerRequestDataSchema = z.object({
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


