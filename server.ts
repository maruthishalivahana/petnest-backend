// Validate required environment variables
if (!process.env.JWT_SECRET) {
    console.error("ERROR: JWT_SECRET is not set in .env file");
    process.exit(1);
}

import cookieParser from 'cookie-parser';
import express from 'express';
import connectDB from './config/database';
import { authRouter } from './routes/user.routes';
import { buyerRouter } from './routes/buyer.routes';
import { adminRouter } from './routes/admin.routes';

const app = express();
app.use(cookieParser());

app.use(express.json());
app.use('/v1/api/auth', authRouter);
app.use('/v1/api/buyer', buyerRouter);
app.use('/v1/api/admin', adminRouter);

const PORT = process.env.PORT || 8080;
console.log(" JWT_SECRET loaded:", !!process.env.JWT_SECRET);
console.log("Email User:", process.env.SMTP_USER ? true : false);
console.log("Email Pass loaded:", !!process.env.SMTP_PASS);


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
