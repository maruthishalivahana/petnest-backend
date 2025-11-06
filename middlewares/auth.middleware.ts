
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
    console.log("verifyToken middleware called");
    console.log("Cookies:", req.cookies);
    console.log("Authorization header:", req.headers.authorization);

    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        console.log("No token found in cookies or authorization header");
        return res.status(403).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        req.user = decoded;
        console.log("Token verified, user:", decoded);
        next();
    } catch (error) {
        console.log("Token verification failed:", error);
        return res.status(401).json({ message: "Invalid token" });
    }
};

// Role-based protection
export const requireRole = (roles: ("buyer" | "seller" | "admin")[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        console.log("requireRole middleware called, user:", req.user);
        if (!req.user || !roles.includes(req.user.role)) {
            console.log("Access denied - role check failed");
            return res.status(403).json({ message: "Access denied" });
        }
        console.log("Role check passed");
        next();
    };
};
