import { z } from 'zod';

export const SignupSchema = z.object({
    name: z.string().min(1, "name is required"),
    email: z.string().email("invalid email address").trim().toLowerCase(),
    password: z.string().min(6, "password must be at least 6 characters long")
        .regex(/[A-Z]/, "password must contain at least one uppercase letter")
        .regex(/[a-z]/, "password must contain at least one lowercase letter")
        .regex(/[0-9]/, "password must contain at least one number")
        .regex(/[@$!%*?&]/, "password must contain at least one special character"),
    role: z.enum(["buyer", "seller", "admin"], "role must be either buyer, seller or admin")
})


export const LoginSchema = z.object({
    email: z.string().email("invalid email address").trim().toLowerCase(),
    password: z.string().min(6, "password must be at least 6 characters long")
        .regex(/[A-Z]/, "password must contain at least one uppercase letter")
        .regex(/[a-z]/, "password must contain at least one lowercase letter")
        .regex(/[0-9]/, "password must contain at least one number")
        .regex(/[@$!%*?&]/, "password must contain at least one special character"),

})

export type LoginData = z.infer<typeof LoginSchema>;
export type SignupData = z.infer<typeof SignupSchema>;

