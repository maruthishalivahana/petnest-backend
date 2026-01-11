import { FeedRepository } from './feed.repo';
import { AdRepository } from '../ad/ad.repo';
import { FeedItem } from './feed.types';

export class FeedService {
    private feedRepo: FeedRepository;
    private adRepo: AdRepository;

    constructor() {
        this.feedRepo = new FeedRepository();
        this.adRepo = new AdRepository();
    }

    async getFeed() {
        try {
            // Fetch all pets
            const pets = await this.feedRepo.getPets();

            // Fetch all active inline ads for pet feed
            const ads = await this.adRepo.findActiveInlineFeedAds();

            // Mix pets with ads (1 ad after every 4 pet cards)
            const feed: FeedItem[] = [];
            let adIndex = 0;

            pets.forEach((pet, index) => {
                // Add pet
                feed.push({
                    type: 'pet',
                    data: pet
                });

                // Insert ad after every 4th pet (index 3, 7, 11, etc.)
                if ((index + 1) % 4 === 0 && ads.length > 0) {
                    // Cycle through ads if we run out
                    const ad = ads[adIndex % ads.length];
                    feed.push({
                        type: 'ad',
                        data: ad
                    });
                    adIndex++;
                }
            });

            return {
                success: true,
                data: feed
            };
        } catch (error) {
            throw new Error(`Failed to fetch feed: ${error}`);
        }
    }
}
