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
    isVerified?: boolean;
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
        isVerified: { type: Boolean, default: false },
        preferences: { type: Schema.Types.Mixed },
        isBanned: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
