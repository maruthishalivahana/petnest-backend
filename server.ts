import dotenv from 'dotenv';
// Load environment variables first
dotenv.config();
import cookies from 'cookie-parser'
import express from 'express';
import connectDB from './config/database';
import { authRouter } from './routes/user.routes';
const app = express();
app.use(cookies());
// Validate required environment variables
if (!process.env.JWT_SECRET) {
    console.error("WARNING: JWT_SECRET is not set in .env file. Using default (not recommended for production)");
}

app.use(express.json());
app.use('/v1/api/auth', authRouter);

const PORT = process.env.PORT || 8080;
console.log("✅ Email User:", process.env.SMTP_USER ? true : false);
console.log("✅ Email Pass loaded:", !!process.env.SMTP_PASS);


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
