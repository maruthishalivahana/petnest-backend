import { z } from "zod";
import { is } from "zod/v4/locales";
export const AdRequestSchema = z.object({
    brandName: z.string().min(2).max(100),
    contactEmail: z.string().email(),
    adSpot: z.enum(['homepageBanner', 'sidebar', 'footer', 'blogFeature'], "Invalid ad spot"),
    message: z.string().max(500).optional(),
    mediaUrl: z.string().url().optional(),
    contactNumber: z.string().min(7).max(15).optional()
})
export type AdRequestType = z.infer<typeof AdRequestSchema>;