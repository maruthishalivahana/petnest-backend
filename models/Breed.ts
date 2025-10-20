import { Document, Types, Schema, model, Model } from 'mongoose';

export interface IBreed extends Document {
    name: string;
    species: string;
    category: string;
    origin?: string;
    localName?: string;
    isNative?: boolean;
    legalStatus: 'Allowed' | 'Restricted' | 'Protected';
    regulationRef?: Types.ObjectId;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

const BreedSchema: Schema<IBreed> = new Schema({
    name: {
        type: String,
        required: true,
        unique: true // bacause  to avoid  duplicate names
    },
    species: {
        type: String,
        required: true,
        category: {
            type: String,
            required: true,
        },
        origin: {
            type: String
        },
        localName: {
            type: String
        },
        isNative: {
            type: String,
            default: false
        },
        legalStatus: {
            type: String,
            enum: ['Allowed', 'Restricted', 'Protected'],
            required: true
        },
        regulationRef: {
            type: Schema.Types.ObjectId,
            ref: 'SpeciesRegulation'
        },
        description: {
            type: String
        }
    }
}, { timestamps: true })

const Breed: Model<IBreed> = model<IBreed>('Breed', BreedSchema)
export default Breed;