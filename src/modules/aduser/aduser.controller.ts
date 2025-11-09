import { AdUserService } from "./adduser.service";
import { Request, Response } from "express";

const adUserService = new AdUserService();



export const requestAdvisementController = async (req: Request, res: Response) => {
    try {
        const adData = req.body;
        const result = (await adUserService.requestAdvisement(adData)).toObject();
        return res.status(201).json({
            message: "Advertisement request submitted successfully",
            data: result
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Error submitting advertisement request",
            error: error.message
        });
    }
}