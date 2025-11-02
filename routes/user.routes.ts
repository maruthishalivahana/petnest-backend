import express from "express";
import { signUp, login, verifyOtpController, resendOtp, logout } from "../controllers/auth.contoller";

export const authRouter = express.Router();

authRouter.post('/signup', signUp);
authRouter.post('/verify-otp', verifyOtpController);
authRouter.post('/resend-otp', resendOtp);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
