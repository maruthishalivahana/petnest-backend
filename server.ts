// Validate required environment variables
if (!process.env.JWT_SECRET) {
    console.error("ERROR: JWT_SECRET is not set in .env file");
    process.exit(1);
}

import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import connectDB from './src/shared/config/database';
import router from './src/routes';


const app = express();

// CORS configuration - allow frontend origin
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(cookieParser());

// Add request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Set timeout for all requests (30 seconds)
app.use((req, res, next) => {
    req.setTimeout(30000);
    res.setTimeout(30000);
    next();
});

// Only parse JSON for non-multipart requests
app.use((req, res, next) => {
    if (req.is('multipart/form-data')) {
        // Skip JSON parsing for multipart requests
        return next();
    }
    express.json()(req, res, next);
});

// Health check endpoint (no authentication required)
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

