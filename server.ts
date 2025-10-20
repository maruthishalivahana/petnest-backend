import dotenv from 'dotenv';
import express from 'express';
import connectDB from './config/database.js';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;

const startServer = async () => {
    try {
        await connectDB()
        app.listen(PORT, () => {
            console.log(`Server running on port: ${PORT}`);
        });
    } catch (err: any) {
        console.error("Failed to start server:", err.message || err);
        process.exit(1);
    }
};

startServer();
