import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateOtp, hashOtp, verifyOtp } from "../../shared/utils/otp";
import { sendOtpEmail } from "../../shared/utils/mailer";
import { AuthRepository } from "./auth.repo";
import { SignupData, LoginData, VerifyOtpData, ResendOtpData } from "./auth.types";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not defined");
}
const OTP_EXPIRY_MINUTES = 10;

export class AuthService {
    private authRepo: AuthRepository;

    constructor() {
        this.authRepo = new AuthRepository();
    }

    async signup(data: SignupData) {
        const { name, email, password, role } = data;

        // Check if user already exists
        const existingUser = await this.authRepo.findUserByEmail(email);
        if (existingUser) {
            throw new Error("User already exists with this email");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate OTP
        const otp = generateOtp();
        const hashedOtp = await hashOtp(otp);
        const otpExpiry = Math.floor(Date.now() / 1000) + (OTP_EXPIRY_MINUTES * 60);

        // Create user
        const newUser = await this.authRepo.createUser({
            name,
            email,
            password: hashedPassword,
            role,
            otpCode: hashedOtp,
            otpExpiry: otpExpiry,
            isVerified: false
        });

        // Send OTP email
        try {
            await sendOtpEmail(email, otp);
            console.log(`OTP sent to ${email}`);
        } catch (emailErr: any) {
            console.error(`Failed to send OTP email during signup for ${email}:`, emailErr);

            // Rollback user creation
            await this.authRepo.deleteUserById(String(newUser._id));
            throw new Error("Failed to send verification email. Please try again.");
        }

        return {
            user: newUser,
            expiresIn: `${OTP_EXPIRY_MINUTES} minutes`
        };
    }

    async verifyOtp(data: VerifyOtpData) {
        const { email, otp } = data;

        const user = await this.authRepo.findUserByEmail(email);
        if (!user) {
            throw new Error("User not found");
        }

        if (user.isVerified) {
            throw new Error("User is already verified. Please login.");
        }

        if (!user.otpCode || !user.otpExpiry) {
            throw new Error("No OTP found. Please request a new one.");
        }

        const currentTime = Math.floor(Date.now() / 1000);
        if (user.otpExpiry < currentTime) {
            throw new Error("OTP has expired. Please request a new one.");
        }

        const isOtpValid = await verifyOtp(Number(otp), user.otpCode);
        if (!isOtpValid) {
            throw new Error("Invalid OTP. Please try again.");
        }

        // Update user verification status
        const updatedUser = await this.authRepo.verifyUser(String(user._id));

        return updatedUser;
    }

    async resendOtp(data: ResendOtpData) {
        const { email } = data;

        const user = await this.authRepo.findUserByEmail(email);
        if (!user) {
            throw new Error("User not found");
        }

        if (user.isVerified) {
            throw new Error("User is already verified. Please login.");
        }

        // Generate new OTP
        const otp = generateOtp();
        const hashedOtp = await hashOtp(otp);
        const otpExpiry = Math.floor(Date.now() / 1000) + (OTP_EXPIRY_MINUTES * 60);

        // Update user with new OTP
        await this.authRepo.updateUserOtp(String(user._id), hashedOtp, otpExpiry);

        // Send OTP email
        try {
            await sendOtpEmail(email, otp);
            console.log(`OTP resent to ${email}`);
        } catch (emailErr: any) {
            console.error(`Failed to resend OTP email to ${email}:`, emailErr);
            throw new Error("Failed to send OTP email. Please try again.");
        }

        return {
            expiresIn: `${OTP_EXPIRY_MINUTES} minutes`
        };
    }

    async login(data: LoginData) {
        const { email, password } = data;

        const user = await this.authRepo.findUserByEmail(email);
        if (!user) {
            throw new Error("User not found");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error("Invalid credentials");
        }

        if (!user.isVerified) {
            throw new Error("Please verify your email before logging in. Check your inbox for the OTP.");
        }

        // Generate JWT token
        const jwtToken = jwt.sign(
            { id: user._id, role: user.role },
            JWT_SECRET as string,
            { expiresIn: '7d' }
        );

        return {
            token: jwtToken,
            user
        };
    }

    async getUserById(userId: string) {
        return await this.authRepo.findUserById(userId);
    }

    // ✅ NEW: Get user with seller data populated
    // Used by /me endpoint to return complete user + seller profile
    async getUserByIdWithSeller(userId: string) {
        return await this.authRepo.findUserByIdWithSeller(userId);
    }
}
