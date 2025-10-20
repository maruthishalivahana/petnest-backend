import { Document, Schema, model, Types, Model } from 'mongoose';


export interface IReview extends Document {
    buyerId: Types.ObjectId;
    sellerId: Types.ObjectId;
    petId?: Types.ObjectId;
    rating: number;
    title?: string;
    comment?: string;
    isApproved: boolean;
    createdAt: Date;
    updatedAt: Date;
}


const ReviewSchema: Schema<IReview> = new Schema(
    {
        buyerId: {
            type: Schema.Types.ObjectId, ref:
                'User', required: true
        },
        sellerId: {
            type: Schema.Types.ObjectId,
            ref: 'SellerProfile', required:
                true
        },
        petId: {
            type: Schema.Types.ObjectId,
            ref: 'Pet'
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        title: {
            type: String
        },
        comment: {
            type: String
        },
        isApproved: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

const Review: Model<IReview> = model<IReview>('Review', ReviewSchema);

export default Review;
