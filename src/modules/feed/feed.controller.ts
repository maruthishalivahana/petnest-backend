import { Request, Response } from 'express';
import { FeedService } from './feed.service';

const feedService = new FeedService();

export const getFeed = async (req: Request, res: Response) => {
    try {
        const { page, limit, device, species, breed } = req.query;
        const query = {
            page: page ? parseInt(page as string) : undefined,
            limit: limit ? parseInt(limit as string) : undefined,
            device: device as 'mobile' | 'desktop' | 'both' | undefined,
            species: species as string | undefined,
            breed: breed as string | undefined
        };

        const result = await feedService.getFeed(query);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Internal server error'
        });
    }
};
