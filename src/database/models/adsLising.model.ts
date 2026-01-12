import { Schema, Document, model, Model, Types } from "mongoose";

export type AdPlacement =
    | 'home_top_banner'
    | 'home_footer'
    | 'pet_feed_inline'
    | 'pet_mobile_sticky'
    | 'pet_detail_below_desc';

export type AdDevice = 'mobile' | 'desktop' | 'both';

export interface IAd extends Document {
    title: string;
    subtitle?: string;
    tagline?: string;
    brandName: string;
    imageUrl: string;
    ctaText: string;
    redirectUrl: string;
    placement: AdPlacement;
    device: AdDevice;
    startDate: Date;
    endDate: Date;
    impressions: number;
    clicks: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const AdSchema = new Schema<IAd>({
    title: {
        type: String,
        required: true,
        maxlength: 60
    },
    subtitle: {
        type: String,
        maxlength: 120
    },
    tagline: {
        type: String,
        maxlength: 60
    },
    brandName: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    ctaText: {
        type: String,
        required: true
    },
    redirectUrl: {
        type: String,
        required: true
    },
    placement: {
        type: String,
        enum: [
            'home_top_banner',
            'home_footer',
            'pet_feed_inline',
            'pet_mobile_sticky',
            'pet_detail_below_desc'
        ],
        required: true
    },
    device: {
        type: String,
        enum: ['mobile', 'desktop', 'both'],
        default: 'both'
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    impressions: {
        type: Number,
        default: 0
    },
    clicks: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
},
    { timestamps: true }
);

// Performance indexes for ad queries
AdSchema.index({ isActive: 1, placement: 1, device: 1 }); // Filter by active, placement, device
AdSchema.index({ startDate: 1, endDate: 1 }); // Date range queries
AdSchema.index({ placement: 1, isActive: 1, startDate: 1, endDate: 1 }); // Compound index for placement queries

export const Ad: Model<IAd> = model<IAd>('Ad', AdSchema);