import { Document, Schema, model, Model } from "mongoose";

interface ISpeciesAttrs {
    speciesName: string;
    scientificName: string;
    category: string;
    protectionLevel?: string;
    allowedForTrade: boolean;
    referenceAct?: string;
    notes?: string;
}

export interface ISpecies extends Document, ISpeciesAttrs {
    createdAt?: Date;
    updatedAt?: Date;
}

const speciesSchema: Schema<ISpecies> = new Schema({
    speciesName: {
        type: String,
        required: true,
        unique: true
    },
    category: {
        type: String,
        required: true
    },
    scientificName: {
        type: String,
        required: true
    },
    protectionLevel: {
        type: String
    },
    allowedForTrade: {
        type: Boolean,
        required: true,
        default: false
    },
    referenceAct: {
        type: String
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

const species: Model<ISpecies> = model<ISpecies>('SpeciesRegulation', speciesSchema);
export default species;