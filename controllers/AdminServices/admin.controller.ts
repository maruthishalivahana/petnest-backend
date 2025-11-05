import User from "../../models/User";
import { Request, Response } from "express";
export const getAllUsersController = async (req: Request, res: Response) => {
    try {
        const adminId = req.user?.id;
        if (!adminId) {
            return res.status(403).json({
                message: "Access denied"
            })
        }
        const users = await User.find({})
        if (!users || users.length === 0) {
            return res.status(404).json({
                message: "No users found"
            })
        }

        return res.status(200).json({
            message: "Users fetched successfully",
            users: users
        })

    } catch (error) {

    }
}

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
        const user = await User.findOneAndDelete({ _id: userId });
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }
        return res.status(200).json({
            message: "User deleted successfully",
            user: user
        })

    } catch (error) {
        console.error("Error deleting user:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}