import Seller from "../../database/models/seller.model";
import { ISeller } from "../../database/models/seller.model";
import User from "../../database/models/user.model";
import mongoose from "mongoose";

export class SellerRepository {
    async findSellerByUserId(userId: string) {
        try {
            return await Seller.findOne({ userId: new mongoose.Types.ObjectId(userId) });
        } catch (error) {
            throw new Error("Failed to get seller request by user id");
        }
    }

    async createSellerRequest(data: Partial<ISeller>) {
        try {
            return await Seller.create(data);
        } catch (error) {
            throw new Error("Failed to send seller request");
        }
    }

    // Update user role to seller when verification is approved
    async updateUserRoleToSeller(userId: string) {
        try {
            await User.findByIdAndUpdate(
                userId,
                { role: "seller" },
                { new: true }
            );
        } catch (error) {
            console.error("Failed to update user role to seller:", error);
            throw new Error("Failed to update user role to seller");
        }
    }

    async updateSellerStatus(sellerId: string, status: string, notes?: string) {
        try {
            return await Seller.findOneAndUpdate(
                { _id: new mongoose.Types.ObjectId(sellerId) },
                { status, verificationNotes: notes, verificationDate: new Date() },
                { new: true }
            );
        } catch (error) {
            throw new Error("Failed to update seller request status");
        }
    }

    // Update seller profile (for verified sellers to update their own info)
    async updateSellerProfile(userId: string, updateData: any) {
        try {
            return await Seller.findOneAndUpdate(
                { userId: new mongoose.Types.ObjectId(userId), status: 'verified' },
                { $set: updateData },
                { new: true }
            ).populate('userId', 'name email');
        } catch (error) {
            console.error("Failed to update seller profile:", error);
            throw new Error("Failed to update seller profile");
        }
    }

    async findPendingSellerRequests() {
        try {
            return await Seller.find({ status: "pending" });
        } catch (error) {
            throw new Error("Failed to get pending seller requests");
        }
    }

    async findSellerById(sellerId: string) {
        try {
            return await Seller.findOne({ _id: new mongoose.Types.ObjectId(sellerId) })
                .populate('userId', 'name email');
        } catch (error) {
            throw new Error("Failed to get seller request by id");
        }
    }

    async findAllVerifiedSellers() {
        try {
            return await Seller.find({ status: "verified" })
                .populate('userId', 'name email');
        } catch (error) {
            throw new Error("Failed to get all sellers");
        }
    }

    async findSellerByIdSimple(sellerId: string) {
        try {
            if (!mongoose.Types.ObjectId.isValid(sellerId)) {
                return null;
            }

            const sellerObjectId = new mongoose.Types.ObjectId(sellerId);
            return await Seller.findOne({ _id: sellerObjectId });
        } catch (error) {
            console.error("Error in findSellerByIdSimple:", error);
            throw new Error("Failed to get seller");
        }
    }

    async findSellerByUserIdSimple(userId: string) {
        try {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return null;
            }

            const userObjectId = new mongoose.Types.ObjectId(userId);
            return await Seller.findOne({ userId: userObjectId }).populate('userId', 'isBanned');
        } catch (error) {
            console.error("Error in findSellerByUserIdSimple:", error);
            throw new Error("Failed to get seller by user ID");
        }
    }

    // ✅ CLEAN ARCHITECTURE: All seller operations work with Seller model
    // No more duplicated data in User model
}
