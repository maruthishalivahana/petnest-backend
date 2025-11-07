import { Document, Types, Schema, model, Model } from 'mongoose';

export interface IBreed extends Document {
    name: string;
    species: Types.ObjectId;
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
        unique: true
    },
    species: {
        type: Schema.Types.ObjectId,
        ref: 'SpeciesRegulation',
        required: true
    },

    origin: {
        type: String
    },
    localName: {
        type: String
    },
    isNative: {
        type: Boolean,
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
}, { timestamps: true });

const Breed: Model<IBreed> = model<IBreed>('Breed', BreedSchema);
export default Breed;
