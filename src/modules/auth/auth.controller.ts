import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import {
    SignupSchema,
    LoginSchema,
    VerifyOtpSchema,
    ResendOtpSchema
} from "../../validations/auth.validation";
import { zodErrorFormatter } from "../../shared/utils/zodError";

const authService = new AuthService();

export const signUp = async (req: Request, res: Response) => {
    try {
        const safedata = SignupSchema.safeParse(req.body);
        if (!safedata.success) {
            return res.status(400).json(zodErrorFormatter(safedata.error));
        }

        const result = await authService.signup(safedata.data);

        const { password: _, otpCode, ...userData } = result.user.toObject();

        return res.status(201).json({
            message: "User created successfully. Please check your email for OTP verification.",
            user: userData,
            expiresIn: result.expiresIn
        });
    } catch (error: any) {
        console.error("Signup error:", error);

        if (error.message === "User already exists with this email") {
            return res.status(400).json({ message: error.message });
        }

        if (error.message === "Failed to send verification email. Please try again.") {
            return res.status(500).json({ message: error.message });
        }

        return res.status(500).json({
            message: "Oops! Something went wrong!",
            errors: error.message
        });
    }
};

export const verifyOtpController = async (req: Request, res: Response) => {
    try {
        const validationResult = VerifyOtpSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validationResult.error.issues
            });
        }

        const user = await authService.verifyOtp(validationResult.data);

        const { password: _, otpCode, ...userData } = user!.toObject();

        return res.status(200).json({
            message: "Email verified successfully! You can now login.",
            user: userData
        });
    } catch (error: any) {
        console.error("Verify OTP error:", error);

        const errorMessage = error.message;

        if (errorMessage === "User not found") {
            return res.status(404).json({ message: errorMessage });
        }

        if (errorMessage === "User is already verified. Please login.") {
            return res.status(400).json({ message: errorMessage });
        }

        if (errorMessage === "No OTP found. Please request a new one." ||
            errorMessage === "OTP has expired. Please request a new one." ||
            errorMessage === "Invalid OTP. Please try again.") {
            return res.status(400).json({ message: errorMessage });
        }

        return res.status(500).json({
            message: "Oops! Something went wrong!",
            errors: error.message
        });
    }
};

export const resendOtp = async (req: Request, res: Response) => {
    try {
        const validationResult = ResendOtpSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validationResult.error.issues
            });
        }

        const result = await authService.resendOtp(validationResult.data);

        return res.status(200).json({
            message: "OTP has been resent to your email.",
            expiresIn: result.expiresIn
        });
    } catch (error: any) {
        console.error("Resend OTP error:", error);

        const errorMessage = error.message;

        if (errorMessage === "User not found") {
            return res.status(404).json({ message: errorMessage });
        }

        if (errorMessage === "User is already verified. Please login.") {
            return res.status(400).json({ message: errorMessage });
        }

        if (errorMessage === "Failed to send OTP email. Please try again.") {
            return res.status(500).json({ message: errorMessage });
        }

        return res.status(500).json({
            message: "Oops! Something went wrong!",
            errors: error.message
        });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const safedata = LoginSchema.safeParse(req.body);
        if (!safedata.success) {
            return res.status(400).json(zodErrorFormatter(safedata.error));
        }

        const result = await authService.login(safedata.data);

        res.cookie('token', result.token, {
            httpOnly: true,
            secure: false,          // OK in localhost
            sameSite: 'lax',        // Fix: Chrome will now accept this
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
        });


        const { password: _, otpCode, ...userData } = result.user.toObject();

        return res.status(200).json({
            message: "Login successful!",
            user: userData,
        });
    } catch (error: any) {
        console.error("Login error:", error);

        const errorMessage = error.message;

        if (errorMessage === "User not found") {
            return res.status(404).json({ message: errorMessage });
        }

        if (errorMessage === "Invalid credentials") {
            return res.status(401).json({ message: errorMessage });
        }

        if (errorMessage === "Please verify your email before logging in. Check your inbox for the OTP.") {
            return res.status(403).json({ message: errorMessage });
        }

        return res.status(500).json({
            message: "Oops! Something went wrong!",
            errors: error.message
        });
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            sameSite: 'none'
        });

        return res.status(200).json({
            message: "Logout successful"
        });
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({
            message: "Oops! Something went wrong!",
            errors: (error as Error).message
        });
    }
};

export const me = async (req: Request, res: Response) => {
    try {
        // Check if user is authenticated via middleware
        if (!req.user) {
            return res.status(401).json({
                message: "Not authenticated"
            });
        }

        // Extract user ID from req.user (set by verifyToken middleware)
        const userId = req.user.id;

        // Fetch full user data from database
        const user = await authService.getUserById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Remove sensitive fields
        const { password, otpCode, otpExpiry, ...userData } = user.toObject();

        return res.status(200).json({
            message: "Authenticated",
            user: userData
        });
    } catch (error: any) {
        console.error("Get current user error:", error);
        return res.status(500).json({
            message: "Oops! Something went wrong!",
            errors: error.message
        });
    }
};
