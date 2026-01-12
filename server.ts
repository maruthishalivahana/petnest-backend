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

// CORS configuration - MUST come BEFORE rate limiting
// This allows preflight OPTIONS requests to pass through
app.use(cors({
    origin: [
        process.env.FRONTEND_URL || "http://localhost:3000",
        "http://localhost:3000",
        "http://localhost:3001"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 86400 // Cache preflight for 24 hours
}));

// Security headers (AFTER CORS to avoid conflicts)
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Response compression (gzip)
app.use(compression());

// Global rate limiter - Increased for development/normal use
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Increased from 100 to 500 requests per 15 minutes
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting for OPTIONS (preflight) requests
    skip: (req) => req.method === 'OPTIONS'
});

// Stricter rate limiter for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // Increased from 5 to 10 for better UX
    message: 'Too many authentication attempts, please try again later.',
    skip: (req) => req.method === 'OPTIONS'
});

// Apply rate limiter to API routes
app.use('/v1/api', globalLimiter);

app.use(cookieParser());

// Request logging (only in development)
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
        next();
    });
}

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

