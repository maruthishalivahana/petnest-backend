import Seller from "../../database/models/seller.model";
import { ISeller } from "../../database/models/seller.model";
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

    // ============= NEW DUAL-MODE SELLER METHODS =============

    async enableSellerMode(userId: string) {
        try {
            // Import User model
            const User = (await import("../../database/models/user.model")).default;

            const user = await User.findById(userId);
            if (!user) {
                throw new Error("User not found");
            }

            // If already enabled, return current state
            if (user.isSellerModeEnabled) {
                return {
                    message: "Seller mode is already enabled",
                    isSellerModeEnabled: true,
                    sellerInfo: user.sellerInfo
                };
            }

            // Enable seller mode and initialize sellerInfo if not exists
            user.isSellerModeEnabled = true;
            if (!user.sellerInfo) {
                user.sellerInfo = {
                    verificationStatus: 'pending',
                    documents: [],
                    analytics: {
                        totalViews: 0,
                        totalClicks: 0,
                        totalMessages: 0
                    }
                };
            }

            await user.save();

            return {
                message: "Seller mode enabled successfully",
                isSellerModeEnabled: user.isSellerModeEnabled,
                sellerInfo: user.sellerInfo
            };
        } catch (error) {
            console.error("Error in enableSellerMode:", error);
            throw new Error("Failed to enable seller mode");
        }
    }

    async uploadSellerDocuments(userId: string, documents: string[]) {
        try {
            const User = (await import("../../database/models/user.model")).default;

            const user = await User.findById(userId);
            if (!user) {
                throw new Error("User not found");
            }

            if (!user.isSellerModeEnabled) {
                throw new Error("Seller mode is not enabled");
            }

            // Update documents and set verification status to pending
            if (!user.sellerInfo) {
                user.sellerInfo = {
                    verificationStatus: 'pending',
                    documents: [],
                    analytics: {
                        totalViews: 0,
                        totalClicks: 0,
                        totalMessages: 0
                    }
                };
            }

            user.sellerInfo.documents = documents;
            user.sellerInfo.verificationStatus = 'pending';

            await user.save();

            return {
                message: "Documents uploaded successfully. Verification pending.",
                sellerInfo: user.sellerInfo
            };
        } catch (error) {
            console.error("Error in uploadSellerDocuments:", error);
            throw error;
        }
    }

    async getSellerVerificationStatus(userId: string) {
        try {
            const User = (await import("../../database/models/user.model")).default;

            const user = await User.findById(userId).select('isSellerModeEnabled sellerInfo');
            if (!user) {
                throw new Error("User not found");
            }

            return {
                isSellerModeEnabled: user.isSellerModeEnabled,
                verificationStatus: user.sellerInfo?.verificationStatus || 'pending',
                sellerInfo: user.sellerInfo
            };
        } catch (error) {
            console.error("Error in getSellerVerificationStatus:", error);
            throw new Error("Failed to get seller verification status");
        }
    }

    async getSellerAnalytics(userId: string) {
        try {
            const User = (await import("../../database/models/user.model")).default;

            const user = await User.findById(userId).select('sellerInfo');
            if (!user) {
                throw new Error("User not found");
            }

            if (!user.isSellerModeEnabled) {
                throw new Error("Seller mode is not enabled");
            }

            return {
                analytics: user.sellerInfo?.analytics || {
                    totalViews: 0,
                    totalClicks: 0,
                    totalMessages: 0
                }
            };
        } catch (error) {
            console.error("Error in getSellerAnalytics:", error);
            throw error;
        }
    }

    async updateSellerAnalytics(userId: string, analyticsUpdate: {
        totalViews?: number;
        totalClicks?: number;
        totalMessages?: number;
    }) {
        try {
            const User = (await import("../../database/models/user.model")).default;

            const user = await User.findById(userId);
            if (!user) {
                throw new Error("User not found");
            }

            if (!user.isSellerModeEnabled) {
                throw new Error("Seller mode is not enabled");
            }

            if (!user.sellerInfo) {
                user.sellerInfo = {
                    verificationStatus: 'pending',
                    documents: [],
                    analytics: {
                        totalViews: 0,
                        totalClicks: 0,
                        totalMessages: 0
                    }
                };
            }

            if (!user.sellerInfo.analytics) {
                user.sellerInfo.analytics = {
                    totalViews: 0,
                    totalClicks: 0,
                    totalMessages: 0
                };
            }

            // Update analytics
            if (analyticsUpdate.totalViews !== undefined) {
                user.sellerInfo.analytics.totalViews =
                    (user.sellerInfo.analytics.totalViews || 0) + analyticsUpdate.totalViews;
            }
            if (analyticsUpdate.totalClicks !== undefined) {
                user.sellerInfo.analytics.totalClicks =
                    (user.sellerInfo.analytics.totalClicks || 0) + analyticsUpdate.totalClicks;
            }
            if (analyticsUpdate.totalMessages !== undefined) {
                user.sellerInfo.analytics.totalMessages =
                    (user.sellerInfo.analytics.totalMessages || 0) + analyticsUpdate.totalMessages;
            }

            await user.save();

            return {
                message: "Analytics updated successfully",
                analytics: user.sellerInfo.analytics
            };
        } catch (error) {
            console.error("Error in updateSellerAnalytics:", error);
            throw error;
        }
    }

    // Admin methods for dual-mode seller verification
    async adminUpdateSellerVerification(userId: string, status: 'pending' | 'verified' | 'rejected', notes?: string) {
        try {
            const User = (await import("../../database/models/user.model")).default;

            const user = await User.findById(userId);
            if (!user) {
                throw new Error("User not found");
            }

            if (!user.isSellerModeEnabled) {
                throw new Error("User has not enabled seller mode");
            }

            if (!user.sellerInfo) {
                throw new Error("Seller info not found");
            }

            user.sellerInfo.verificationStatus = status;

            await user.save();

            return {
                message: `Seller verification status updated to ${status}`,
                userId: user._id,
                email: user.email,
                name: user.name,
                sellerInfo: user.sellerInfo,
                notes
            };
        } catch (error) {
            console.error("Error in adminUpdateSellerVerification:", error);
            throw error;
        }
    }

    async getAllDualModeSellers() {
        try {
            const User = (await import("../../database/models/user.model")).default;

            const sellers = await User.find({ isSellerModeEnabled: true })
                .select('name email isSellerModeEnabled sellerInfo createdAt updatedAt')
                .sort({ updatedAt: -1 });

            return {
                message: "Dual-mode sellers fetched successfully",
                total: sellers.length,
                sellers: sellers.map(seller => ({
                    id: seller._id,
                    name: seller.name,
                    email: seller.email,
                    isSellerModeEnabled: seller.isSellerModeEnabled,
                    verificationStatus: seller.sellerInfo?.verificationStatus || 'pending',
                    documents: seller.sellerInfo?.documents || [],
                    whatsappNumber: seller.sellerInfo?.whatsappNumber,
                    analytics: seller.sellerInfo?.analytics,
                    createdAt: seller.createdAt,
                    updatedAt: seller.updatedAt
                }))
            };
        } catch (error) {
            console.error("Error in getAllDualModeSellers:", error);
            throw new Error("Failed to fetch dual-mode sellers");
        }
    }
}
