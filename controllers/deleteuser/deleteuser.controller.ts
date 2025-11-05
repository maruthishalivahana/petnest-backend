import { deleteuserByIdService } from "../../AdminServices/deleteuserService/deleteuser";
import { Request, Response } from "express";
import { z } from "zod";

export const deleteuserByIdController = async (req: Request, res: Response) => {
    try {
        const adminId = req.user?.id;
        if (!adminId) {
            return res.status(403).json({
                message: "Access denied"
            })
        }
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({
                message: "Invalid user id"
            })
        }
        await deleteuserByIdService(userId);
        return res.status(200).json({
            message: "User deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}