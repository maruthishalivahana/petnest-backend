import { Document, Schema, model, Types, Model } from 'mongoose';


export interface IWishlist extends Document {
    buyerId: Types.ObjectId;
    petId: Types.ObjectId;
    createdAt: Date;
}


const WishlistSchema: Schema<IWishlist> = new Schema(
    {
        buyerId: {
            type: Schema.Types.ObjectId,
            ref: 'User', required: true
        },
        petId: {
            type: Schema.Types.ObjectId,
            ref: 'Pet',
            required: true
        }
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);


const Wishlist: Model<IWishlist> = model<IWishlist>('Wishlist', WishlistSchema);

export default Wishlist;
