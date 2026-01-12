import { Request, Response } from 'express';
import { WhatsAppService } from './whatsapp.service';

const whatsappService = new WhatsAppService();

/**
 * Generate WhatsApp link with prefilled message
 * GET /api/whatsapp/generate?sellerId=xxx&petId=xxx
 * PUBLIC ENDPOINT - No auth required (for guest users)
 */
export const generateWhatsAppLink = async (req: Request, res: Response) => {
    try {
        const { sellerId, petId } = req.query;

        // Validate required parameters
        if (!sellerId || !petId) {
            return res.status(400).json({
                success: false,
                message: 'sellerId and petId are required query parameters'
            });
        }

        // Validate format (basic MongoDB ObjectId check)
        if (typeof sellerId !== 'string' || typeof petId !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Invalid parameter format'
            });
        }

        if (sellerId.length !== 24 || petId.length !== 24) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID format'
            });
        }

        const result = await whatsappService.generateWhatsAppLink({
            sellerId: sellerId as string,
            petId: petId as string
        });

        if (!result.success) {
            return res.status(404).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error in generateWhatsAppLink controller:', error);
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Internal server error'
        });
    }
};

/**
 * Track WhatsApp click
 * POST /api/whatsapp/track
 * PUBLIC ENDPOINT - No auth required
 */
export const trackWhatsAppClick = async (req: Request, res: Response) => {
    try {
        const { sellerId, petId, buyerId } = req.body;

        // Validate required fields
        if (!sellerId || !petId) {
            return res.status(400).json({
                success: false,
                message: 'sellerId and petId are required'
            });
        }

        // Validate ID format
        if (typeof sellerId !== 'string' || typeof petId !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Invalid parameter format'
            });
        }

        if (sellerId.length !== 24 || petId.length !== 24) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID format'
            });
        }

        const result = await whatsappService.trackWhatsAppClick({
            sellerId,
            petId,
            buyerId: buyerId || undefined
        });

        if (!result.success) {
            return res.status(400).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error in trackWhatsAppClick controller:', error);
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Internal server error'
        });
    }
};
