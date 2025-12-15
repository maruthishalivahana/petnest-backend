
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set");
}

const JWT_SECRET: string = process.env.JWT_SECRET;

interface JwtPayload {
    id: string;
    role: "buyer" | "seller" | "admin";
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(403).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

// Role-based protection
export const requireRole = (roles: ("buyer" | "seller" | "admin")[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied" });
        }
        next();
    };
};

// Middleware to check if seller mode is enabled and verified (for dual-mode system)
export const requireSellerVerified = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(403).json({ message: "Access denied" });
        }

        // Import User model dynamically to avoid circular dependency
        const User = (await import("../../database/models/user.model")).default;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if seller mode is enabled
        if (!user.isSellerModeEnabled) {
            return res.status(403).json({
                message: "Seller mode is not enabled. Please enable seller mode first."
            });
        }

        // Check if seller is verified
        if (user.sellerInfo?.verificationStatus !== 'verified') {
            return res.status(403).json({
                message: "Your seller account is not verified yet. Please complete verification first.",
                verificationStatus: user.sellerInfo?.verificationStatus || 'pending'
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            message: "Failed to verify seller status",
            error: (error as Error).message
        });
    }
};

