import { AdRequestRepository } from './adRequest.repo';
import { CreateAdRequestDTO, UpdateAdRequestStatusDTO, AdRequestQuery } from './adRequest.types';

export class AdRequestService {
    private repo: AdRequestRepository;

    constructor() {
        this.repo = new AdRequestRepository();
    }

    async createAdRequest(data: CreateAdRequestDTO) {
        try {
            const adRequest = await this.repo.create(data);
            return {
                success: true,
                message: 'Ad request submitted successfully',
                data: adRequest
            };
        } catch (error) {
            throw new Error(`Failed to create ad request: ${error}`);
        }
    }

    async getAllAdRequests(query: AdRequestQuery) {
        try {
            const data = await this.repo.findAll(query);

            return {
                success: true,
                data
            };
        } catch (error) {
            throw new Error(`Failed to fetch ad requests: ${error}`);
        }
    }

    async updateAdRequestStatus(id: string, data: UpdateAdRequestStatusDTO) {
        try {
            const adRequest = await this.repo.findById(id);

            if (!adRequest) {
                return {
                    success: false,
                    message: 'Ad request not found'
                };
            }

            if (adRequest.status !== 'pending') {
                return {
                    success: false,
                    message: 'Only pending requests can be updated'
                };
            }

            if (data.status === 'rejected' && !data.rejectionReason) {
                return {
                    success: false,
                    message: 'Rejection reason is required when rejecting a request'
                };
            }

            const updated = await this.repo.updateStatus(id, data);

            return {
                success: true,
                message: `Ad request ${data.status} successfully`,
                data: updated
            };
        } catch (error) {
            throw new Error(`Failed to update ad request status: ${error}`);
        }
    }
}
