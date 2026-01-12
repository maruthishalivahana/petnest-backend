import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        throw new Error("MONGO_URI is not defined in environment variables");
    }

    try {
        await mongoose.connect(mongoUri, {
            maxPoolSize: 10, // Maximum 10 connections in pool
            minPoolSize: 2,  // Minimum 2 connections always ready
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        });

        console.log("Database connected successfully");

        // Log connection pool metrics in development
        if (process.env.NODE_ENV !== 'production') {
            mongoose.connection.on('connected', () => {
                console.log('MongoDB connection established');
            });

            mongoose.connection.on('error', (err) => {
                console.error('MongoDB connection error:', err);
            });

            mongoose.connection.on('disconnected', () => {
                console.log('MongoDB disconnected');
            });
        }
    } catch (err: any) {
        console.error("Database connection failed:", err.message || err);
        throw err; // Re-throw to stop server startup
    }
};

export default connectDB;
