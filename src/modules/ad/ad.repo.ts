import { Ad, IAd, AdPlacement, AdDevice } from '@database/models/adsLising.model';
import { CreateAdDTO, UpdateAdDTO, AdQuery } from './ad.types';

export class AdRepository {
    async create(data: CreateAdDTO): Promise<IAd> {
        const ad = new Ad(data);
        return await ad.save();
    }

    async findAll(query: AdQuery): Promise<{ data: any[], total: number }> {
        const { placement, device, isActive, page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;

        const filter: any = {};
        if (placement) filter.placement = placement;
        if (device) {
            filter.$or = [
                { device: device },
                { device: 'both' }
            ];
        }
        if (isActive !== undefined) filter.isActive = isActive;

        const [data, total] = await Promise.all([
            Ad.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Ad.countDocuments(filter)
        ]);

        return { data, total };
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

    async findActiveInlineFeedAds(device?: AdDevice): Promise<any[]> {
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
