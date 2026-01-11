import AdRequest, { IAdRequest } from '@database/models/adsRequest.model';
import { CreateAdRequestDTO, UpdateAdRequestStatusDTO, AdRequestQuery } from './adRequest.types';

export class AdRequestRepository {
    async create(data: CreateAdRequestDTO): Promise<IAdRequest> {
        const adRequest = new AdRequest(data);
        return await adRequest.save();
    }

    async findAll(query: AdRequestQuery): Promise<any[]> {
        const filter: any = {};
        if (query.status) {
            filter.status = query.status;
        }

        return await AdRequest.find(filter).sort({ createdAt: -1 }).lean();
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
