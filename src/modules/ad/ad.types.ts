import { AdPlacement, AdDevice } from '@database/models/adsLising.model';

export interface CreateAdDTO {
    title: string;
    subtitle?: string;
    tagline?: string;
    brandName: string;
    imageUrl: string;
    ctaText: string;
    redirectUrl: string;
    placement: AdPlacement;
    device?: AdDevice;
    startDate: Date;
    endDate: Date;
}

export interface UpdateAdDTO {
    title?: string;
    subtitle?: string;
    tagline?: string;
    brandName?: string;
    imageUrl?: string;
    ctaText?: string;
    redirectUrl?: string;
    placement?: AdPlacement;
    device?: AdDevice;
    startDate?: Date;
    endDate?: Date;
    isActive?: boolean;
}

export interface TrackingDTO {
    adId: string;
    type: 'impression' | 'click';
}
