

import Advertisement from '../../database/models/ads.model'
import { IAdvertisement } from '../../database/models/ads.model';
export class adUserRepository {

    async requestAdvisement(adData: Partial<IAdvertisement>) {
        try {
            const newAd = new Advertisement(adData);
            return await newAd.save();

        } catch (error: any) {
            console.error("Error requesting advertisement:", error);
            throw new Error("Error requesting advertisement: " + error.message);
        }

    }
}