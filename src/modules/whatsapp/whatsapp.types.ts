export interface GenerateWhatsAppLinkDTO {
    sellerId: string;
    petId: string;
}

export interface TrackWhatsAppClickDTO {
    sellerId: string;
    petId: string;
    buyerId?: string; // Optional: track which buyer clicked
}

export interface WhatsAppLinkResponse {
    success: boolean;
    message?: string;
    data?: {
        whatsappLink: string;
        trackingId: string; // For click tracking
    };
}

export interface WhatsAppTrackingResponse {
    success: boolean;
    message: string;
}
