import { Schema, Document, model, Model, Types } from "mongoose";

export interface IAdListing extends Document {
    title: string;
    images: string[];
    description?: string;
    adminId: Types.ObjectId;
    advertisementId: Types.ObjectId;
    status: 'active' | 'inactive' | 'paused' | 'rejected' | 'expired';
    adSpot: 'homepageBanner' | 'sidebar' | 'footer' | 'blogFeature';
    startDate: Date;
    endDate: Date;
    createdAt: Date;
    updatedAt: Date;
    scheduledAt?: Date;
}

const AdListingSchema = new Schema<IAdListing>({
    images: {
        type: [String],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    adminId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    advertisementId: {
        type: Schema.Types.ObjectId,
        ref: 'AdvertisementRequests'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'paused', 'rejected', 'expired'],
        default: 'inactive'
    },
    adSpot: {
        type: String,
        enum: ['homepageBanner', 'sidebar', 'footer', 'blogFeature'],
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    scheduledAt: {
        type: Date
    }
},
    { timestamps: true }
);

export const AdListing: Model<IAdListing> = model<IAdListing>('AdListings', AdListingSchema);