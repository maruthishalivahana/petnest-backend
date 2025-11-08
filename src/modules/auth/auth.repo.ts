import User from "../../database/models/user.model";
import { IUser } from "../../database/models/user.model";

export class AuthRepository {
    async findUserByEmail(email: string) {
        return await User.findOne({ email });
    }

    async findUserById(userId: string) {
        return await User.findById(userId);
    }

    async createUser(userData: Partial<IUser>) {
        const newUser = new User(userData);
        return await newUser.save();
    }

    async deleteUserById(userId: string) {
        return await User.deleteOne({ _id: userId });
    }

    async verifyUser(userId: string) {
        return await User.findByIdAndUpdate(
            userId,
            {
                isVerified: true,
                $unset: { otpCode: 1, otpExpiry: 1 }
            },
            { new: true }
        );
    }

    async updateUserOtp(userId: string, hashedOtp: string, otpExpiry: number) {
        return await User.findByIdAndUpdate(
            userId,
            {
                otpCode: hashedOtp,
                otpExpiry: otpExpiry
            },
            { new: true }
        );
    }
}
