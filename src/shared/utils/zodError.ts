import { ZodError } from "zod/v4/classic/external.cjs";

export const zodErrorFormatter = (error: ZodError) => {
    const first = error.issues[0];
    const firstField = first?.path?.length ? first.path.join('.') : 'input';
    const friendlyMessage = `Invalid ${firstField}: ${first.message}`;
    const formatted = error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
    }));
    return {
        message: friendlyMessage,
        errors: formatted,
        help: 'Ensure all fields are valid (e.g. name: string, email: valid email, password: strong password).'
    };
}
