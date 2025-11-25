import express from "express";
import {
    signUp,
    login,
    verifyOtpController,
    resendOtp,
    logout,
    me
} from "../modules/auth";
import { verifyToken } from "../shared/middlewares/auth.middleware";

export const authRouter = express.Router();

// ============= AUTHENTICATION =============
// User signup
authRouter.post('/signup', signUp);

// Verify OTP after signup
authRouter.post('/verify-otp', verifyOtpController);

// Resend OTP
authRouter.post('/resend-otp', resendOtp);

// User login
authRouter.post('/login', login);

// User logout
authRouter.post('/logout', logout);

// Get current authenticated user
authRouter.get('/me', verifyToken, me);
