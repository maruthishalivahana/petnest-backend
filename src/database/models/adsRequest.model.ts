import { Document, Schema, model, Types, Model } from 'mongoose';


export interface IAdvertisement extends Document {
    brandName: string;
    contactEmail?: string;
    contactNumber?: string;
    adSpot: 'homepageBanner' | 'sidebar' | 'footer' | 'blogFeature';
    message?: string;
    mediaUrl?: string;
    isActive: boolean;
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
            enum: ['homepageBanner', 'sidebar', 'footer', 'blogFeature'],
            required: true
        },
        isActive: {
            type: Boolean,
            default: false
        },
        message: {
            type: String
        },
        mediaUrl: {
            type: String
        }
    },
    { timestamps: true }
);

const Advertisement: Model<IAdvertisement> = model<IAdvertisement>('AdvertisementRequests', AdvertisementSchema);

export default Advertisement;
