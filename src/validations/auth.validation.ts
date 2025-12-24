import { z } from 'zod';
import { is } from 'zod/v4/locales';

export const SignupSchema = z.object({
    name: z.string().min(1, "name is required"),
    email: z.string().email("invalid email address").trim().toLowerCase(),
    password: z.string().min(6, "password must be at least 6 characters long")
        .regex(/[A-Z]/, "password must contain at least one uppercase letter")
        .regex(/[a-z]/, "password must contain at least one lowercase letter")
        .regex(/[0-9]/, "password must contain at least one number")
        .regex(/[@$!%*?&]/, "password must contain at least one special character"),
    // ✅ Role is now "buyer" or "admin" only - seller is a capability, not a role
    // Users enable seller mode separately after registration
    role: z.enum(["buyer", "admin"], "role must be either buyer or admin"),
    isVerified: z.boolean().optional().default(false)
})


export const LoginSchema = z.object({
    email: z.string().email("invalid email address").trim().toLowerCase(),
    password: z.string().min(6, "password must be at least 6 characters long")
        .regex(/[A-Z]/, "password must contain at least one uppercase letter")
        .regex(/[a-z]/, "password must contain at least one lowercase letter")
        .regex(/[0-9]/, "password must contain at least one number")
        .regex(/[@$!%*?&]/, "password must contain at least one special character"),

})

export const VerifyOtpSchema = z.object({
    email: z.string().email("invalid email address").trim().toLowerCase(),
    otp: z.string().length(6, "OTP must be 6 digits")
})

export const ResendOtpSchema = z.object({
    email: z.string().email("invalid email address").trim().toLowerCase()
})

export type LoginData = z.infer<typeof LoginSchema>;
export type SignupData = z.infer<typeof SignupSchema>;
export type VerifyOtpData = z.infer<typeof VerifyOtpSchema>;
export type ResendOtpData = z.infer<typeof ResendOtpSchema>;

