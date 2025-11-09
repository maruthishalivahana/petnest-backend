import { z } from "zod";

export const AdListingSchema = z.object({
    title: z.string().min(5).max(150),
    description: z.string().max(1000).optional(),
    images: z.array(z.string()).min(1, "At least one image is required"),
    adminId: z.string().min(1),
    advertisementId: z.string().min(1).optional(),
    status: z.enum(['active', 'inactive', 'paused', 'rejected', 'expired']).optional(),
    adSpot: z.enum(['homepageBanner', 'sidebar', 'footer', 'blogFeature']),
    startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid start date"
    }),
    endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid end date"
    }),
    scheduledAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid scheduled date"
    }).optional()
}).superRefine((data, ctx) => {
    if (data.startDate && data.endDate) {
        const start = Date.parse(data.startDate);
        const end = Date.parse(data.endDate);
        if (isNaN(start) || isNaN(end)) return;
        if (end <= start) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "End date must be after start date",
                path: ["endDate"],
            });
        }
    }
});

export type AdListingType = z.infer<typeof AdListingSchema>;
