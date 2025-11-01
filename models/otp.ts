import mongoose from "mongoose";
import { Document, Schema, model, Types, Model } from 'mongoose';

export interface IOTP extends Document {
    userId: Types.ObjectId;
    otpCode: Number;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const OtpSchema: Schema<IOTP> = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    otpCode: {
        type: Number,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});
