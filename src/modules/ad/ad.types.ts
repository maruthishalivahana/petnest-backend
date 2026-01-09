import { AdPlacement, AdDevice } from '@database/models/adsLising.model';

export interface CreateAdDTO {
    title: string;
    imageUrl: string;
    ctaText: string;
    redirectUrl: string;
    placement: AdPlacement;
    device?: AdDevice;
    targetPages?: string[];
    startDate: Date;
    endDate: Date;
}

export interface UpdateAdDTO {
    title?: string;
    imageUrl?: string;
    ctaText?: string;
    redirectUrl?: string;
    placement?: AdPlacement;
    device?: AdDevice;
    targetPages?: string[];
    startDate?: Date;
    endDate?: Date;
    isActive?: boolean;
}

export interface AdQuery {
    placement?: AdPlacement;
    device?: AdDevice;
    isActive?: boolean;
    page?: number;
    limit?: number;
}

export interface TrackingDTO {
    adId: string;
    type: 'impression' | 'click';
}
