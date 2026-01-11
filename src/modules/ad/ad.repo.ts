import { Ad, IAd, AdPlacement, AdDevice } from '@database/models/adsLising.model';
import { CreateAdDTO, UpdateAdDTO } from './ad.types';

export class AdRepository {
    async create(data: CreateAdDTO): Promise<IAd> {
        const ad = new Ad(data);
        return await ad.save();
    }

    async findAll(): Promise<any[]> {
        return await Ad.find({}).sort({ createdAt: -1 }).lean();
    }

    async findActive(): Promise<any[]> {
        return await Ad.find({ isActive: true }).sort({ createdAt: -1 }).lean();
    }

    async findById(id: string): Promise<IAd | null> {
        return await Ad.findById(id);
    }

    async update(id: string, data: UpdateAdDTO): Promise<IAd | null> {
        return await Ad.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id: string): Promise<IAd | null> {
        return await Ad.findByIdAndDelete(id);
    }

    async toggleActive(id: string): Promise<IAd | null> {
        const ad = await Ad.findById(id);
        if (!ad) return null;

        ad.isActive = !ad.isActive;
        return await ad.save();
    }

    async incrementImpression(id: string): Promise<IAd | null> {
        return await Ad.findByIdAndUpdate(
            id,
            { $inc: { impressions: 1 } },
            { new: true }
        );
    }

    async incrementClick(id: string): Promise<IAd | null> {
        return await Ad.findByIdAndUpdate(
            id,
            { $inc: { clicks: 1 } },
            { new: true }
        );
    }

    async findActiveByPlacement(placement: AdPlacement, device?: AdDevice): Promise<any[]> {
        const now = new Date();
        const filter: any = {
            placement,
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        };

        if (device) {
            filter.$or = [
                { device: device },
                { device: 'both' }
            ];
        }

        return await Ad.find(filter).lean();
    }

    async findActiveInlineFeedAds(): Promise<any[]> {
        const now = new Date();
        const filter: any = {
            placement: 'pet_feed_inline',
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        };

        return await Ad.find(filter).lean();
    }

    async findActiveInlineFeedAdsOld(device?: AdDevice): Promise<any[]> {
        const now = new Date();
        const filter: any = {
            placement: 'pet_feed_inline',
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        };

        if (device) {
            filter.$or = [
                { device: device },
                { device: 'both' }
            ];
        }

        return await Ad.find(filter).lean();
    }
}
