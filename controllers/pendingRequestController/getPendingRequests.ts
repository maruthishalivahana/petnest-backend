import { getAllPendingRequestsService } from "../../AdminServices/getAllpendingRequestService/pedingRequests";
import { Request, Response } from "express";
import { z } from "zod";
export const getAllPendingRequestsController = async (req: Request, res: Response) => {
    try {
        const adminId = req.user?.id;
        if (!adminId) {
            return res.status(403).json({
                message: "Access denied"
            });
        }
        const pendingRequests = await getAllPendingRequestsService();
        return res.status(200).json({
            message: "Pending requests fetched successfully",
            total: pendingRequests.length,
            pendingRequests: pendingRequests
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: "Validation failed",
                errors: error.issues
            });
        }
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}