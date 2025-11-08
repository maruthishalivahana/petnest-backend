import { ca, tr } from "zod/v4/locales";
import seller from "../models/SellerProfile";
import { SellerRequestData } from "../validations/sellerRequestData.validation";
import mongoose from "mongoose";

export const getSellerRequestByUserId = async (userId: string) => {
    try {
        return await seller.findOne({ userId: new mongoose.Types.ObjectId(userId) });

    } catch (error) {
        throw new Error("Failed to get seller request by user id");
    }
};

export const sendSellerRequest = async (data: SellerRequestData) => {
    try {
        const newRequest = await seller.create(data);
        return newRequest;

    }
    catch (error) {
        throw new Error("Failed to send seller request");
    }
}
export const updateSellerRequestStatus = async (sellerId: string, status: string, notes?: string) => {
    try {
        const updateStatus = await seller.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(sellerId) },
            { status, verificationNotes: notes, verificationDate: new Date() },
            { new: true })

        return updateStatus
    } catch (error) {
        throw new Error("Failed to update seller request status");

    }
}
export const getAllSellerPendingRequests = async () => {
    try {
        const pendingRequests = await seller.find({ status: "pending" });
        return pendingRequests;
    } catch (error) {
        throw new Error("Failed to get pending seller requests");

    }
}
export const getSellerById = async (sellerId: string) => {
    try {
        const sellerRequest = await seller.findOne({ _id: new mongoose.Types.ObjectId(sellerId) }).populate('userId', 'name email');
        return sellerRequest;
    } catch (error) {
        throw new Error("Failed to get seller request by id");
    }
}

export const getAllSellers = async () => {
    try {
        const sellers = await seller.find({ status: "verified" }).populate('userId', 'name email');
        return sellers;
    } catch (error) {
        throw new Error("Failed to get all sellers");
    }
}

export const getSeller = async (sellerId: string) => {
    try {
        console.log("getSeller - Input sellerId:", sellerId);

        // Validate if sellerId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(sellerId)) {
            console.log("Invalid ObjectId format");
            return null;
        }

        const sellerObjectId = new mongoose.Types.ObjectId(sellerId);
        const sellerExists = await seller.findOne({ _id: sellerObjectId });

        console.log("getSeller - Found seller:", sellerExists ? { id: sellerExists._id, status: sellerExists.status } : null);

        return sellerExists;
    } catch (error) {
        console.error("Error in getSeller:", error);
        throw new Error("Failed to get seller");
    }
}

export const getSellerByUserId = async (userId: string) => {
    try {
        console.log("getSellerByUserId - Input userId:", userId);

        // Validate if userId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.log("Invalid ObjectId format");
            return null;
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);
        const sellerExists = await seller.findOne({ userId: userObjectId });

        console.log("getSellerByUserId - Found seller:", sellerExists ? { id: sellerExists._id, status: sellerExists.status } : null);

        return sellerExists;
    } catch (error) {
        console.error("Error in getSellerByUserId:", error);
        throw new Error("Failed to get seller by user ID");
    }
}


