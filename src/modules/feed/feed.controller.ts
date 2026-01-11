import { Request, Response } from 'express';
import { FeedService } from './feed.service';

const feedService = new FeedService();

export const getFeed = async (req: Request, res: Response) => {
    try {
        const result = await feedService.getFeed();
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Internal server error'
        });
    }
};
