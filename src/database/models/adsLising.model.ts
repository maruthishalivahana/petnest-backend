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
    imageUrl: string;
    ctaText: string;
    redirectUrl: string;
    placement: AdPlacement;
    device: AdDevice;
    targetPages: string[];
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
    targetPages: {
        type: [String],
        default: []
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

export const Ad: Model<IAd> = model<IAd>('Ad', AdSchema);