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
    otpCode: number;
    otpExpiry: number
    preferences?: Record<string, any>;
    isBanned: boolean;
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
            type: Number,
            required: true
        },
        otpExpiry: {
            type: Number,
        },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
