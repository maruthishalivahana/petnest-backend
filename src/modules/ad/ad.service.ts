import { AdRepository } from './ad.repo';
import { CreateAdDTO, UpdateAdDTO } from './ad.types';
import { AdPlacement, AdDevice } from '@database/models/adsLising.model';

export class AdService {
    private repo: AdRepository;

    constructor() {
        this.repo = new AdRepository();
    }

    async createAd(data: CreateAdDTO) {
        try {
            // Validate dates
            const startDate = new Date(data.startDate);
            const endDate = new Date(data.endDate);

            if (endDate <= startDate) {
                return {
                    success: false,
                    message: 'End date must be after start date'
                };
            }

            const ad = await this.repo.create(data);
            return {
                success: true,
                message: 'Ad created successfully',
                data: ad
            };
        } catch (error) {
            throw new Error(`Failed to create ad: ${error}`);
        }
    }

    async getAllAds() {
        try {
            const data = await this.repo.findAll();

            return {
                success: true,
                data
            };
        } catch (error) {
            throw new Error(`Failed to fetch ads: ${error}`);
        }
    }

    async getActiveAds() {
        try {
            const data = await this.repo.findActive();

            return {
                success: true,
                data
            };
        } catch (error) {
            throw new Error(`Failed to fetch active ads: ${error}`);
        }
    }

    async getAdById(id: string) {
        try {
            const ad = await this.repo.findById(id);

            if (!ad) {
                return {
                    success: false,
                    message: 'Ad not found'
                };
            }

            return {
                success: true,
                data: ad
            };
        } catch (error) {
            throw new Error(`Failed to fetch ad: ${error}`);
        }
    }

    async updateAd(id: string, data: UpdateAdDTO) {
        try {
            const ad = await this.repo.findById(id);

            if (!ad) {
                return {
                    success: false,
                    message: 'Ad not found'
                };
            }

            // Validate dates if both are provided
            if (data.startDate && data.endDate) {
                const startDate = new Date(data.startDate);
                const endDate = new Date(data.endDate);

                if (endDate <= startDate) {
                    return {
                        success: false,
                        message: 'End date must be after start date'
                    };
                }
            }

            const updated = await this.repo.update(id, data);

            return {
                success: true,
                message: 'Ad updated successfully',
                data: updated
            };
        } catch (error) {
            throw new Error(`Failed to update ad: ${error}`);
        }
    }

    async deleteAd(id: string) {
        try {
            const ad = await this.repo.delete(id);

            if (!ad) {
                return {
                    success: false,
                    message: 'Ad not found'
                };
            }

            return {
                success: true,
                message: 'Ad deleted successfully'
            };
        } catch (error) {
            throw new Error(`Failed to delete ad: ${error}`);
        }
    }

    async toggleAdStatus(id: string) {
        try {
            const ad = await this.repo.toggleActive(id);

            if (!ad) {
                return {
                    success: false,
                    message: 'Ad not found'
                };
            }

            return {
                success: true,
                message: `Ad ${ad.isActive ? 'activated' : 'deactivated'} successfully`,
                data: ad
            };
        } catch (error) {
            throw new Error(`Failed to toggle ad status: ${error}`);
        }
    }

    async getAdsByPlacement(placement: AdPlacement, device?: AdDevice) {
        try {
            const ads = await this.repo.findActiveByPlacement(placement, device);

            return {
                success: true,
                data: ads
            };
        } catch (error) {
            throw new Error(`Failed to fetch ads by placement: ${error}`);
        }
    }

    async trackImpression(adId: string) {
        try {
            const ad = await this.repo.incrementImpression(adId);

            if (!ad) {
                return {
                    success: false,
                    message: 'Ad not found'
                };
            }

            return {
                success: true,
                message: 'Impression tracked'
            };
        } catch (error) {
            throw new Error(`Failed to track impression: ${error}`);
        }
    }

    async trackClick(adId: string) {
        try {
            const ad = await this.repo.incrementClick(adId);

            if (!ad) {
                return {
                    success: false,
                    message: 'Ad not found'
                };
            }

            return {
                success: true,
                message: 'Click tracked'
            };
        } catch (error) {
            throw new Error(`Failed to track click: ${error}`);
        }
    }

    async extendAllAdDates(days: number) {
        try {
            if (days < 1 || days > 365) {
                return {
                    success: false,
                    message: 'Days must be between 1 and 365'
                };
            }

            const result = await this.repo.extendAllAdDates(days);

            return {
                success: true,
                message: `Extended ${result.modifiedCount} ads by ${days} days`,
                data: result
            };
        } catch (error) {
            throw new Error(`Failed to extend ad dates: ${error}`);
        }
    }
}
