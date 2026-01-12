// Validate required environment variables
if (!process.env.JWT_SECRET) {
    console.error("ERROR: JWT_SECRET is not set in .env file");
    process.exit(1);
}

import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import connectDB from './src/shared/config/database';
import router from './src/routes';


const app = express();

// Simple CORS configuration - Allow all for development
app.use(cors({
    origin: true, // Allow all origins in development
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Set-Cookie"]
}));

// Disable security headers that might interfere
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false
}));

app.use(compression());
app.use(cookieParser());
app.use(express.json());

// Request logging (only in development)
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Mount all API routes under /v1/api
app.use('/v1/api', router);

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

