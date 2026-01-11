import { Request, Response } from 'express';
import { AdRequestService } from './adRequest.service';

const adRequestService = new AdRequestService();

// Public endpoint - no auth required
export const createAdRequest = async (req: Request, res: Response) => {
    try {
        const result = await adRequestService.createAdRequest(req.body);
        return res.status(201).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Internal server error'
        });
    }
};

// Admin only
export const getAllAdRequests = async (req: Request, res: Response) => {
    try {
        const { status } = req.query;
        const query = {
            status: status as 'pending' | 'approved' | 'rejected' | undefined
        };

        const result = await adRequestService.getAllAdRequests(query);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Internal server error'
        });
    }
};

// Admin only
export const updateAdRequestStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await adRequestService.updateAdRequestStatus(id, req.body);

        if (!result.success) {
            return res.status(400).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Internal server error'
        });
    }
};
