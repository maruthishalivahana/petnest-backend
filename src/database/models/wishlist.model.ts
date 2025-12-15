import { Document, Schema, model, Types, Model } from 'mongoose';

/**
 * NEW CART-STYLE WISHLIST ARCHITECTURE
 * One document per user with an array of wishlist items
 * This eliminates cross-user access issues and improves performance
 */

export interface IWishlistItem {
    pet: Types.ObjectId;
    addedAt: Date;
}

export interface IWishlist extends Document {
    user: Types.ObjectId;
    items: IWishlistItem[];
    createdAt: Date;
    updatedAt: Date;
}

const WishlistSchema: Schema<IWishlist> = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true, // One wishlist document per user
            index: true   // Fast lookups by user
        },
        items: [
            {
                pet: {
                    type: Schema.Types.ObjectId,
                    ref: 'Pet',
                    required: true
                },
                addedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ]
    },
    {
        timestamps: true // Automatically manages createdAt and updatedAt
    }
);

// Compound index for fast wishlist checks
WishlistSchema.index({ user: 1, 'items.pet': 1 });

const Wishlist: Model<IWishlist> = model<IWishlist>('Wishlist', WishlistSchema);

export default Wishlist;
