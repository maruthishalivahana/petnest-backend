import { Document, Schema, model, Types, Model } from 'mongoose';


export interface IBlog extends Document {
    title: string;
    slug: string;
    coverImage?: string;
    content: string;
    excerpt?: string;
    category?: string;
    tags?: string[];
    authorId: Types.ObjectId;
    isPublished: boolean;
    publishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// 2️⃣ Mongoose schema
const BlogSchema: Schema<IBlog> = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        slug: {
            type: String,
            required: true,
            unique: true
        },
        coverImage: { type: String },
        content: {
            type: String,
            required: true
        },
        excerpt: {
            type: String
        },
        category: {
            type: String
        },
        tags: {
            type: [String],
            default: []
        },
        authorId: {
            type: Schema.Types.ObjectId,
            ref: 'User', required: true
        },
        isPublished: {
            type: Boolean,
            default: false
        },
        publishedAt: { type: Date }
    },
    { timestamps: true }
);

const Blog: Model<IBlog> = model<IBlog>('Blog', BlogSchema);

export default Blog;
