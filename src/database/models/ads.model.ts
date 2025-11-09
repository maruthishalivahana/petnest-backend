import { Document, Schema, model, Types, Model } from 'mongoose';


export interface IAdvertisement extends Document {
    brandName: string;
    contactEmail?: string;
    contactNumber?: string;
    adSpot: 'homepageBanner' | 'sidebar' | 'footer' | 'blogFeature';
    message?: string;
    mediaUrl?: string;
    status: 'pending' | 'active' | 'paused' | 'expired' | 'rejected';
    startDate?: Date;
    endDate?: Date;
    createdByAdminId?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}


const AdvertisementSchema: Schema<IAdvertisement> = new Schema(
    {
        brandName: {
            type: String,
            required: true
        },
        contactEmail: {
            type: String
        },
        contactNumber: {
            type: String
        },
        adSpot: {
            type: String,
            enum: ['homepageBanner', 'sidebar', 'footer', 'blog_feature'],
            required: true
        },
        message: {
            type: String
        },
        mediaUrl: {
            type: String
        },
        status: {
            type: String,
            enum: ['pending', 'active', 'paused', 'expired', 'rejected'],
            default: 'pending'
        },
        startDate: {
            type: Date
        },
        endDate: {
            type: Date
        },
        createdByAdminId: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    { timestamps: true }
);

const Advertisement: Model<IAdvertisement> = model<IAdvertisement>('Advertisement', AdvertisementSchema);

export default Advertisement;
