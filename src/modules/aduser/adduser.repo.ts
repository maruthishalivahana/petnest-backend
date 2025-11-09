

import Advertisement from '../../database/models/ads.model'
import { IAdvertisement } from '../../database/models/ads.model';
export class adUserRepository {

    async requestAdvisement(adData: Partial<IAdvertisement>) {
        const newAd = new Advertisement(adData);
        return await newAd.save();

    }
}