import { Document, Schema, model, Types, Model } from 'mongoose';


export interface IReport extends Document {
    reporterId: Types.ObjectId;
    targetType: 'pet' | 'seller' | 'review' | 'user' | 'ad';
    targetId: Types.ObjectId;
    reason: string;
    details?: string;
    status: 'pending' | 'in_review' | 'resolved' | 'dismissed';
    adminNotes?: string;
    actionTaken?: string;
    createdAt: Date;
    updatedAt: Date;
}


const ReportSchema: Schema<IReport> = new Schema(
    {
        reporterId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        targetType: {
            type: String,
            enum: ['pet', 'seller', 'review', 'user', 'ad'],
            required: true
        },
        targetId: {
            type: Schema.Types.ObjectId,
            required: true
        },
        reason: {
            type: String,
            required: true
        },
        details: {
            type: String
        },
        status: {
            type: String,
            enum: ['pending', 'in_review', 'resolved', 'dismissed'],
            default: 'pending'
        },
        adminNotes: {
            type: String
        },
        actionTaken: {
            type: String
        }
    },
    { timestamps: true }
);

const Report: Model<IReport> = model<IReport>('Report', ReportSchema);

export default Report;
