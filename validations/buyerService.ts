import { z } from "zod";
export const BuyerProfileSchema = z.object({
    name: z.string().min(1, {
        error: (issue) => {
            if (issue.code === 'too_small') {
                return 'Name is required';
            }
        }
    }),
    profilePic: z.string().url({
        error: () => 'Invalid URL format for profile picture'
    }).optional(),
    phoneNumber: z.string()
        .regex(/^\+?[\d\s\-()]+$/, {
            error: () => 'Invalid phone number format'
        })
        .min(10, {
            error: (issue) => {
                if (issue.code === 'too_small') {
                    return 'Phone number must be at least 10 digits long';
                }
            }
        }).optional(),
    bio: z.string().max(500, {
        error: (issue) => {
            if (issue.code === 'too_big') {
                return 'Bio must be at most 500 characters long';
            }
        }
    }).optional(),
    location: z.string().optional(),
    preferences: z.array(z.string()).optional(),

})