import User from "../../database/models/user.model";
import { IUser } from "../../database/models/user.model";
import Advertisement from "../../database/models/adsRequest.model";
import { AdListing } from "@database/models/adsLising.model";
import { IAdListing } from "@database/models/adsLising.model";

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

    async findByIsActive() {
        const ads = await Advertisement.find({ isApproved: false });
        return ads;
    }

    async findById(adid: string) {
        const ad = await Advertisement.findById(adid);
        return ad;
    }

    async updateAdvertisementStatus(adId: string, isApproved: boolean) {
        return await Advertisement.findByIdAndUpdate(
            adId,
            { isApproved: isApproved },
            { new: true }
        );
    }

    async getAllApprovedAdvertisements() {
        const ads = await Advertisement.find({ isApproved: true });
        return ads;
    }
    async createAdListing(adData: Partial<IAdListing>) {
        const newAdListing = new AdListing(adData);
        return await newAdListing.save();
    }
    async findActiveAdSpot(adSpot: string) {
        const activeAdInSpot = await AdListing.findOne({
            adSpot: adSpot,
            status: "active"
        });
        return activeAdInSpot;
    }

    async findAllActiveAdListing() {
        const adListings = await AdListing.find({ status: "active" });
        return adListings;
    }
    async updateAdListingStatus(adListingId: string, status: string) {
        return await AdListing.findByIdAndUpdate(
            adListingId,
            { status: status },
            { new: true }
        );
    }
    async findByid(adListingId: string) {
        const adListing = await AdListing.findById(adListingId);
        return adListing;
    }
    async updateAdListing(adListingId: string, updateData: Partial<IAdListing>) {
        return await AdListing.findByIdAndUpdate(adListingId, updateData, { new: true });
    }

    async deleteAdListing(adListingId: string) {
        return await AdListing.findByIdAndDelete(adListingId);
    }

    // async findAllAdListings(filter: Partial<IAdListing> = {}, options: { skip?: number; limit?: number } = {}) {
    //     const q = AdListing.find(filter as any);
    //     if (options.skip) q.skip(options.skip);
    //     if (options.limit) q.limit(options.limit);
    //     return await q.exec();
    // }

    async getAllAdListings() {
        const q = AdListing.find({});
        return await q.exec();
    }

}