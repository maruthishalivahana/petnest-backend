import User from "../../database/models/user.model";
import { IUser } from "../../database/models/user.model";
import Advertisement from "../../database/models/adsRequest.model";

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

    async getPendingAdvertisements() {
        const ads = await Advertisement.find({ isActive: false });
        return ads;
    }

    async getAdvertisementById(adId: string) {
        const ad = await Advertisement.findById(adId);
        return ad;
    }
    async updateAdvertisementStatus(adId: string, status: 'pending' | 'active' | 'paused' | 'expired' | 'rejected') {
        const ad = await Advertisement.findByIdAndUpdate(
            adId,
            { status },
            { new: true }
        );
        return ad;
    }
}
