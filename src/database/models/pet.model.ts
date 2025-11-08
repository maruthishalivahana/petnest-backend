import { Document, Types, Schema, model, Model } from 'mongoose';
import Breed from './breed.model';

export interface IPet extends Document {
    sellerId: Types.ObjectId;
    breedId: Types.ObjectId;
    breedName: string;
    name: string;
    category: string;
    gender: 'male' | 'female' | 'unknown';
    age?: string;
    price?: number;
    currency?: string;
    description?: string;
    vaccinationInfo?: string;
    images?: string[];
    location?: {
        city?: string;
        state?: string;
        pincode?: string;
    };
    status: 'active' | 'sold' | 'removed' | 'rejected' | 'featured';
    isVerified: boolean;
    featuredRequest?: {
        isRequested: boolean;
        approvedBy?: Types.ObjectId;
        approvedAt?: Date;
    };
    createdAt: Date;
    updatedAt: Date;
}


const PetSchema: Schema<IPet> = new Schema(
    {
        sellerId: {
            type: Schema.Types.ObjectId,
            ref: 'SellerRequests',
            required: true
        },
        breedId: {
            type: Schema.Types.ObjectId,
            ref: 'Breed',
            required: true
        },
        breedName: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        category: {
            type: String,

        },
        gender: {
            type: String,
            enum: ['male', 'female', 'unknown'],
            required: true
        },
        age: {
            type: String
        },
        price: {
            type: Number
        },
        currency: {
            type: String
        },
        description: {
            type: String
        },
        vaccinationInfo: {
            type: String
        },
        images: {
            type: [String],
            default: []
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
            },

        },
        status: {
            type: String,
            enum: ['active', 'sold', 'removed', 'rejected', 'featured'],
            default: 'active'
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        featuredRequest: {
            isRequested: {
                type: Boolean,
                default: false
            },
            approvedBy: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            },
            approvedAt: {
                type: Date
            }
        },
        // metrics: {
        //     views: { type: Number, default: 0 },
        //     saves: { type: Number, default: 0 },
        //     whatsappClicks: { type: Number, default: 0 }
        // }
    },
    { timestamps: true }
);

PetSchema.pre('save', async function (next) {
    if (this.isModified('breedId')) {
        const breed = await Breed.findById(this.breedId);
        if (breed) this.category = String(breed.species);
    }
    next();
});

const Pet: Model<IPet> = model<IPet>('Pet', PetSchema);

export default Pet;
