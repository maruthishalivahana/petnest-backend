import { z } from 'zod';

// Ad Request Validation
export const CreateAdRequestSchema = z.object({
    brandName: z.string().min(1, 'Brand name is required'),
    contactEmail: z.string().email('Invalid email address'),
    contactNumber: z.string().optional(),
    requestedPlacement: z.string().min(1, 'Requested placement is required'),
    message: z.string().optional(),
    mediaUrl: z.string().url('Invalid URL').optional()
});

export const UpdateAdRequestStatusSchema = z.object({
    status: z.enum(['approved', 'rejected'], {
        required_error: 'Status is required',
        invalid_type_error: 'Status must be either approved or rejected'
    }),
    rejectionReason: z.string().optional()
}).refine(
    (data) => {
        if (data.status === 'rejected' && !data.rejectionReason) {
            return false;
        }
        return true;
    },
    {
        message: 'Rejection reason is required when rejecting a request',
        path: ['rejectionReason']
    }
);

// Ad Management Validation
export const CreateAdSchema = z.object({
    title: z.string().min(1, 'Title is required').max(60, 'Title must be 60 characters or less'),
    subtitle: z.string().max(120, 'Subtitle must be 120 characters or less').optional(),
    tagline: z.string().max(60, 'Tagline must be 60 characters or less').optional(),
    brandName: z.string().min(1, 'Brand name is required'),
    imageUrl: z.string().url('Invalid image URL'),
    ctaText: z.string().min(1, 'CTA text is required'),
    redirectUrl: z.string().url('Invalid redirect URL'),
    placement: z.enum([
        'home_top_banner',
        'home_footer',
        'pet_feed_inline',
        'pet_mobile_sticky',
        'pet_detail_below_desc'
    ], {
        required_error: 'Placement is required',
        invalid_type_error: 'Invalid placement value'
    }),
    device: z.enum(['mobile', 'desktop', 'both']).optional().default('both'),
    startDate: z.string().datetime('Invalid start date format').or(z.date()),
    endDate: z.string().datetime('Invalid end date format').or(z.date())
}).refine(
    (data) => {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        return end > start;
    },
    {
        message: 'End date must be after start date',
        path: ['endDate']
    }
);

export const UpdateAdSchema = z.object({
    title: z.string().min(1).max(60, 'Title must be 60 characters or less').optional(),
    subtitle: z.string().max(120, 'Subtitle must be 120 characters or less').optional(),
    tagline: z.string().max(60, 'Tagline must be 60 characters or less').optional(),
    brandName: z.string().min(1, 'Brand name is required').optional(),
    imageUrl: z.string().url().optional(),
    ctaText: z.string().min(1).optional(),
    redirectUrl: z.string().url().optional(),
    placement: z.enum([
        'home_top_banner',
        'home_footer',
        'pet_feed_inline',
        'pet_mobile_sticky',
        'pet_detail_below_desc'
    ]).optional(),
    device: z.enum(['mobile', 'desktop', 'both']).optional(),
    startDate: z.string().datetime().or(z.date()).optional(),
    endDate: z.string().datetime().or(z.date()).optional(),
    isActive: z.boolean().optional()
}).refine(
    (data) => {
        if (data.startDate && data.endDate) {
            const start = new Date(data.startDate);
            const end = new Date(data.endDate);
            return end > start;
        }
        return true;
    },
    {
        message: 'End date must be after start date',
        path: ['endDate']
    }
);

// Query Validation
export const GetAdRequestsQuerySchema = z.object({
    status: z.enum(['pending', 'approved', 'rejected']).optional()
});

export const GetAdsByPlacementQuerySchema = z.object({
    placement: z.enum([
        'home_top_banner',
        'home_footer',
        'pet_feed_inline',
        'pet_mobile_sticky',
        'pet_detail_below_desc'
    ]),
    device: z.enum(['mobile', 'desktop', 'both']).optional()
});