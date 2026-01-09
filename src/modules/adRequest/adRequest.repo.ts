import AdRequest, { IAdRequest } from '@database/models/adsRequest.model';
import { CreateAdRequestDTO, UpdateAdRequestStatusDTO, AdRequestQuery } from './adRequest.types';

export class AdRequestRepository {
    async create(data: CreateAdRequestDTO): Promise<IAdRequest> {
        const adRequest = new AdRequest(data);
        return await adRequest.save();
    }

    async findAll(query: AdRequestQuery): Promise<{ data: any[], total: number }> {
        const { status, page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;

        const filter: any = {};
        if (status) {
            filter.status = status;
        }

        const [data, total] = await Promise.all([
            AdRequest.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            AdRequest.countDocuments(filter)
        ]);

        return { data, total };
    }

    async findById(id: string): Promise<IAdRequest | null> {
        return await AdRequest.findById(id);
    }

    async updateStatus(id: string, data: UpdateAdRequestStatusDTO): Promise<IAdRequest | null> {
        return await AdRequest.findByIdAndUpdate(
            id,
            {
                status: data.status,
                ...(data.rejectionReason && { rejectionReason: data.rejectionReason })
            },
            { new: true }
        );
    }
}
