import { Document, Types, Schema, model, Model } from "mongoose";
export interface ISpecies extends Document {
    speciesName: string,
    scientificName: string,
    category: string,
    protectionLevel?: string,
    allowedForTrade: boolean,
    referenceAct: string,
    notes?: string,
    createdAt: Date,
    updatedAt: Date

}

const speciesSchema: Schema<ISpecies> = new Schema({
    speciesName: {
        type: String,
        required: true,
        unique: true
    },
    scientificName: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    protectionLevel: {
        type: String
    },
    allowedForTrade: {
        type: Boolean,
        required: true
    },
    referenceAct: {
        type: String
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
})

const species: Model<ISpecies> = model<ISpecies>('SpeciesRegulation', speciesSchema)
export default species