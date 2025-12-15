import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    role: "buyer" | "seller" | "admin";
    name: string;
    email: string;
    password: string;
    profilePic?: string;
    phoneNumber?: string;
    bio?: string;
    location?: string;
    otpCode?: string; // Store hashed OTP
    otpExpiry?: number;
    isVerified: boolean; // Track email verification status
    preferences?: Record<string, any>;
    isBanned: boolean;

    // Dual-mode seller fields (backward compatible)
    isSellerModeEnabled: boolean;
    sellerInfo?: {
        verificationStatus: 'pending' | 'verified' | 'rejected';
        documents?: string[];
        whatsappNumber?: string;
        analytics?: {
            totalViews?: number;
            totalClicks?: number;
            totalMessages?: number;
        };
    };

    createdAt: Date;
    updatedAt: Date;

}

const UserSchema: Schema<IUser> = new Schema(
    {
        role: { type: String, enum: ["buyer", "seller", "admin"], required: true },
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        profilePic: { type: String },
        phoneNumber: { type: String },
        bio: { type: String },
        location: { type: String },
        preferences: { type: Schema.Types.Mixed },
        isBanned: { type: Boolean, default: false },
        otpCode: {
            type: String, // Store hashed OTP as string
        },
        otpExpiry: {
            type: Number,
        },
        isVerified: {
            type: Boolean,
            default: false // Users start unverified
        },

        // Dual-mode seller fields with safe defaults
        isSellerModeEnabled: {
            type: Boolean,
            default: false
        },
        sellerInfo: {
            verificationStatus: {
                type: String,
                enum: ['pending', 'verified', 'rejected'],
                default: 'pending'
            },
            documents: {
                type: [String],
                default: []
            },
            whatsappNumber: {
                type: String
            },
            analytics: {
                totalViews: { type: Number, default: 0 },
                totalClicks: { type: Number, default: 0 },
                totalMessages: { type: Number, default: 0 }
            }
        },

        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
