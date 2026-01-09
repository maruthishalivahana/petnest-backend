import { Request, Response } from 'express';
import { AdService } from './ad.service';
import { AdPlacement, AdDevice } from '@database/models/adsLising.model';

const adService = new AdService();

// Admin only - Create ad
export const createAd = async (req: Request, res: Response) => {
    try {
        const result = await adService.createAd(req.body);

        if (!result.success) {
            return res.status(400).json(result);
        }

        return res.status(201).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Internal server error'
        });
    }
};

// Admin only - Get all ads
export const getAllAds = async (req: Request, res: Response) => {
    try {
        const { placement, device, isActive, page, limit } = req.query;
        const query = {
            placement: placement as AdPlacement | undefined,
            device: device as AdDevice | undefined,
            isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
            page: page ? parseInt(page as string) : undefined,
            limit: limit ? parseInt(limit as string) : undefined
        };

        const result = await adService.getAllAds(query);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Internal server error'
        });
    }
};

// Public - Get all active/running ads (for website display)
export const getActiveAds = async (req: Request, res: Response) => {
    try {
        const query = {
            isActive: true, // Only get active ads
            page: 1,
            limit: 100 // Get more ads for public display
        };

        const result = await adService.getAllAds(query);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Internal server error'
        });
    }
};

// Admin only - Get ad by ID
export const getAdById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await adService.getAdById(id);

        if (!result.success) {
            return res.status(404).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Internal server error'
        });
    }
};

// Admin only - Update ad
export const updateAd = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await adService.updateAd(id, req.body);

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

// Admin only - Delete ad
export const deleteAd = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await adService.deleteAd(id);

        if (!result.success) {
            return res.status(404).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Internal server error'
        });
    }
};

// Admin only - Toggle ad status
export const toggleAdStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await adService.toggleAdStatus(id);

        if (!result.success) {
            return res.status(404).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Internal server error'
        });
    }
};

// Public - Get ads by placement
export const getAdsByPlacement = async (req: Request, res: Response) => {
    try {
        const { placement } = req.query;
        const device = req.query.device as AdDevice | undefined;

        if (!placement) {
            return res.status(400).json({
                success: false,
                message: 'Placement parameter is required'
            });
        }

        const result = await adService.getAdsByPlacement(placement as AdPlacement, device);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Internal server error'
        });
    }
};

// Public - Track impression
export const trackImpression = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await adService.trackImpression(id);

        if (!result.success) {
            return res.status(404).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Internal server error'
        });
    }
};

// Public - Track click
export const trackClick = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await adService.trackClick(id);

        if (!result.success) {
            return res.status(404).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Internal server error'
        });
    }
};
