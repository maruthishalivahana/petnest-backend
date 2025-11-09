import User from "../../database/models/user.model";
import { IUser } from "../../database/models/user.model";
import Advertisement from "../../database/models/ads.model";

export class UserRepository {
    async findAllUsers() {
        return await User.find({});
    }

    async findUserById(userId: string) {
        return await User.findById(userId);
    }

    async deleteUserById(userId: string) {
        return await User.findByIdAndDelete(userId);
    }

    async updateUser(userId: string, updateData: Partial<IUser>) {
        return await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        );
    }

    async findUsersByRole(role: "buyer" | "seller" | "admin") {
        return await User.find({ role });
    }

    async banUser(userId: string) {
        return await User.findByIdAndUpdate(
            userId,
            { isBanned: true },
            { new: true }
        );
    }

    async unbanUser(userId: string) {
        return await User.findByIdAndUpdate(
            userId,
            { isBanned: false },
            { new: true }
        );
    }

    async getAllAdvertisements() {
        const ads = await Advertisement.find();
        return ads;
    }

    async getAdvertisementByStatus(Status: string) {
        const ads = await Advertisement.find({ status: Status });
        return ads;
    }
}
