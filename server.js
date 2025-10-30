import dotenv from 'dotenv';
import express from 'express';
import connectDB from './config/database.js';
import { authRouter } from './routes/user.routes.js';
dotenv.config();
const app = express();
app.use(express.json());
app.use('/v1/api/auth', authRouter);
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