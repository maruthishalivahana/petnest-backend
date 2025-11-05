import User from "../../models/User";
import { Request, Response } from "express";
import { z } from "zod";
export const getAllUsersController = async (req: Request, res: Response) => {
    try {
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
