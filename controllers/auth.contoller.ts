import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";
import jwt from "jsonwebtoken";
import { generateOtp, hashOtp, verifyOtp } from "../utils/otp";
import { sendOtpEmail } from "../utils/mailer";
import { SignupSchema, LoginSchema } from "../validations/authdata.validation";
import { SignupData, LoginData } from "../validations/authdata.validation";
import { zodErrorFormatter } from "../utils/zodError";

const JWT_SECRET = process.env.JWT_SECRET || "my_super_secret_key_123";
const OTP_EXPIRY_MINUTES = 10; // 10 minutes for OTP validity

export const signUp = async (req: Request, res: Response) => {
    try {
        const safedata = SignupSchema.safeParse(req.body);
        if (!safedata.success) {
            return res.status(400).json(zodErrorFormatter(safedata.error));
        }

        const { name, email, password, role } = safedata.data as SignupData;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists with this email"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOtp();
        const hashedOtp = await hashOtp(otp);
        const otpExpiry = Math.floor(Date.now() / 1000) + (OTP_EXPIRY_MINUTES * 60);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role,
            otpCode: hashedOtp,
            otpExpiry: otpExpiry,
            isVerified: false
        });

        const savedUser = await newUser.save();


        try {
            await sendOtpEmail(email, otp);
            console.log(`OTP sent to ${email}`);
        } catch (emailErr: any) {
            console.error(`Failed to send OTP email during signup for ${email}:`, emailErr);

            await User.deleteOne({ _id: savedUser._id });
            return res.status(500).json({
                message: "Failed to send verification email. Please try again.",
                emailError: emailErr && emailErr.message ? emailErr.message : "Unknown error"
            });
        }

        const { password: _, otpCode, ...userData } = savedUser.toObject();

        return res.status(201).json({
            message: "User created successfully. Please check your email for OTP verification.",
            user: userData,
            expiresIn: `${OTP_EXPIRY_MINUTES} minutes`
        });
    } catch (error: any) {
        console.error("Signup error:", error);
        return res.status(500).json({
            message: "Oops! Something went wrong!",
            errors: error.message
        });
    }
}

export const verifyOtpController = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required"
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                message: "User is already verified. Please login."
            });
        }

        if (!user.otpCode || !user.otpExpiry) {
            return res.status(400).json({
                message: "No OTP found. Please request a new one."
            });
        }

        const currentTime = Math.floor(Date.now() / 1000);
        if (user.otpExpiry < currentTime) {
            return res.status(400).json({
                message: "OTP has expired. Please request a new one."
            });
        }

        const isOtpValid = await verifyOtp(Number(otp), user.otpCode);
        if (!isOtpValid) {
            return res.status(400).json({
                message: "Invalid OTP. Please try again."
            });
        }

        user.isVerified = true;
        user.otpCode = undefined;
        user.otpExpiry = undefined;
        await user.save();

        const { password: _, otpCode, ...userData } = user.toObject();

        return res.status(200).json({
            message: "Email verified successfully! You can now login.",
            user: userData
        });
    } catch (error: any) {
        console.error("Verify OTP error:", error);
        return res.status(500).json({
            message: "Oops! Something went wrong!",
            errors: error.message
        });
    }
}

export const resendOtp = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                message: "User is already verified. Please login."
            });
        }

        const otp = generateOtp();
        const hashedOtp = await hashOtp(otp);
        const otpExpiry = Math.floor(Date.now() / 1000) + (OTP_EXPIRY_MINUTES * 60);

        user.otpCode = hashedOtp;
        user.otpExpiry = otpExpiry;
        await user.save();

        try {
            await sendOtpEmail(email, otp);
            console.log(`OTP resent to ${email}`);
        } catch (emailErr: any) {
            console.error(`Failed to resend OTP email to ${email}:`, emailErr);
            return res.status(500).json({
                message: "Failed to send OTP email. Please try again.",
                emailError: emailErr && emailErr.message ? emailErr.message : "Unknown error"
            });
        }

        return res.status(200).json({
            message: "OTP has been resent to your email.",
            expiresIn: `${OTP_EXPIRY_MINUTES} minutes`
        });
    } catch (error: any) {
        console.error("Resend OTP error:", error);
        return res.status(500).json({
            message: "Oops! Something went wrong!",
            errors: error.message
        });
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const safedata = LoginSchema.safeParse(req.body);
        if (!safedata.success) {
            return res.status(400).json(zodErrorFormatter(safedata.error));
        }

        const { email, password } = safedata.data as LoginData;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                message: "Please verify your email before logging in. Check your inbox for the OTP."
            });
        }

        const jwtToken = jwt.sign(
            { id: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('token', jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const { password: _, otpCode, ...userData } = user.toObject();

        return res.status(200).json({
            message: "Login successful!",
            user: userData,
            token: jwtToken
        });
    } catch (error: any) {
        console.error("Login error:", error);
        return res.status(500).json({
            message: "Oops! Something went wrong!",
            errors: error.message
        });
    }
}
