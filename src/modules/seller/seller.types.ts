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
