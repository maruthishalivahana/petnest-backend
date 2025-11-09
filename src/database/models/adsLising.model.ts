import { Schema, Document, model, Model, Types } from "mongoose";

export interface IAdListing extends Document {
    title: string;
    decription?: string;
    AdminId: Types.ObjectId;
    AdvertisementId: Types.ObjectId;
    Status: 'active' | 'inactive' | 'paused' | 'rejected' | 'expired';
    AdSpot: 'homepageBanner' | 'sidebar' | 'footer' | 'blogFeature';
    startDate: Date;
    endDate: Date;
    createdAt: Date;
    updatedAt: Date;
    sheduledAt?: Date;
}

const AdListingSchema = new Schema<IAdListing>({
    title: {
        type: String,
        required: true
    },
    decription: {
        type: String
    },
    AdminId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    AdvertisementId: {
        type: Schema.Types.ObjectId,
        ref: 'AdvertisementRequests',
        required: true
    },
    Status: {
        type: String,
        enum: ['active', 'inactive', 'paused', 'rejected', 'expired'],
        default: 'inactive'
    },
    AdSpot: {
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
    sheduledAt: {
        type: Date
    }
},
    { timestamps: true }
);

export const AdListing: Model<IAdListing> = model<IAdListing>('AdListings', AdListingSchema);