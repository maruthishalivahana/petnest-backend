import { Document, Schema, model, Model } from 'mongoose';

export interface IAdRequest extends Document {
    brandName: string;
    contactEmail: string;
    contactNumber?: string;
    requestedPlacement: string;
    message?: string;
    mediaUrl?: string;
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

const AdRequestSchema: Schema<IAdRequest> = new Schema(
    {
        brandName: {
            type: String,
            required: true
        },
        contactEmail: {
            type: String,
            required: true
        },
        contactNumber: {
            type: String
        },
        requestedPlacement: {
            type: String,
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
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },
        rejectionReason: {
            type: String
        }
    },
    { timestamps: true }
);

const AdRequest: Model<IAdRequest> = model<IAdRequest>('AdvertisementRequests', AdRequestSchema);

export default AdRequest;
