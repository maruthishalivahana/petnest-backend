

import Advertisement from '../../database/models/adsRequest.model'
import { IAdvertisement } from '../../database/models/adsRequest.model';
export class adUserRepository {

    async requestAdvisement(adData: Partial<IAdvertisement>) {
        const newAd = new Advertisement(adData);
        return await newAd.save();

    }
}