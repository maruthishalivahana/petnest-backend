export interface CreateAdRequestDTO {
    brandName: string;
    contactEmail: string;
    contactNumber?: string;
    requestedPlacement: string;
    message?: string;
    mediaUrl?: string;
}

export interface UpdateAdRequestStatusDTO {
    status: 'approved' | 'rejected';
    rejectionReason?: string;
}

export interface AdRequestQuery {
    status?: 'pending' | 'approved' | 'rejected';
}
