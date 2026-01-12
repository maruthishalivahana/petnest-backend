// Re-export validation types
export type {
    SellerRequestData,
    SellerRequestFullData
} from "../../validations/seller.validation";

// Additional seller-specific types
export interface SellerResponse {
    message: string;
    seller?: any;
    sellers?: any[];
    data?: any;
}

export type SellerStatus = 'pending' | 'verified' | 'rejected' | 'suspended';

export interface UpdateSellerProfileData {
    brandName?: string;
    bio?: string;
    whatsappNumber?: string;
    location?: {
        city?: string;
        state?: string;
        pincode?: string;
    };
}
