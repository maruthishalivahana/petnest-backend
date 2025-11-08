import { getAllUsersService } from "../../../AdminServices/getAlluserService/getallusers";
import { Request, Response } from "express";
import { z } from "zod";
export const getAllUsersController = async (req: Request, res: Response) => {
    try {
        const adminId = req.user?.id;
        const users = await getAllUsersService();
        return res.status(200).json({
            message: "Users fetched successfully",
            users: users
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: "Validation failed",
                errors: error.issues
            });
        }
        console.error("Error fetching users:", error);
        return res.status(500).json({ error: "Failed to fetch users" });
    }
}