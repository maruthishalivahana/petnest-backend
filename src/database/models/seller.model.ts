import mongoose, { Document, Schema, Types, Model } from "mongoose";
export interface ISeller extends Document {
    userId: Types.ObjectId,
    brandName: string,
    logoUrl: string,
    bio?: string,
    whatsappNumber?: string,
    location?: {
        city?: string,
        state?: string,
        pincode?: string,
    },
    documents?: {
        idProof?: string,
        certificate?: string,
        shopImage?: string
    };
    status: 'pending' | 'verified' | 'rejected' | 'suspended',

    verificationNotes?: string,
    verificationDate?: Date,
    analytics?: {
        totalViews?: number,
        wishlistsSaves?: number,
        avgRating?: number
    },
    totalWhatsappClicks?: number,
    createdAt: Date,
    updatedAt: Date
}

const sellerSchema: Schema<ISeller> = new Schema({
    // ✅ SINGLE SOURCE OF TRUTH: Each user can have only ONE seller profile
    // This enforces data integrity at the database level
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,  // ✅ Enforces one seller per user
        index: true    // ✅ Optimizes lookups
    },
    brandName: {
        type: String,
        required: true,
    },
    logoUrl: {
        type: String
    },
    bio: {
        type: String
    },
    whatsappNumber: {
        type: String
    },
    location: {
        city: {
            type: String
        },
        state: {
            type: String
        },
        pincode: {
            type: String
        }
    },
    documents: {
        idProof: {
            type: String,
            required: true
        },
        certificate: {
            type: String,
            required: true
        },
        shopImage: {
            type: String,

        }
    },
    status: {
        type: String,
        enum: ['pending', 'verified', 'rejected', 'suspended'],
        default: 'pending'
    },
    verificationNotes: {
        type: String
    },
    verificationDate: {
        type: Date
    },
    analytics: {
        totalViews: { type: Number, default: 0 },
        wishlistSaves: { type: Number, default: 0 },
        averageRating: { type: Number, default: 0 }
    },
    totalWhatsappClicks: {
        type: Number,
        default: 0
    }

}, { timestamps: true })

const seller: Model<ISeller> = mongoose.model<ISeller>('SellerRequests', sellerSchema)
export default seller