import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import connectDB from './config/database.js';
import { authRouter } from './routes/user.routes.js';
import { buyerRouter } from './routes/buyer.routes.js';

dotenv.config();
const app = express();

// CORS configuration - must come after app initialization
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));



app.use(express.json());
app.use('/v1/api/auth', authRouter);
app.use('/v1/api/buyer', buyerRouter);
const PORT = process.env.PORT || 8080;
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server running on port: ${PORT}`);
        });
    }
    catch (err) {
        console.error("Failed to start server:", err.message || err);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=server.js.map