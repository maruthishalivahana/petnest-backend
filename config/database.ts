import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        throw new Error("MONGO_URI is not defined in environment variables");
    }

    try {
        await mongoose.connect(mongoUri);
        console.log("Database connected successfully");
    } catch (err: any) {
        console.error("Database connection failed:", err.message || err);
    }
};

export default connectDB;
