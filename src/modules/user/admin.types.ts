// Admin module types

export interface SellerVerificationStats {
    pending: number;
    approved: number;
    rejected: number;
}

export interface PetVerificationStats {
    pending: number;
    approved: number;
    rejected: number;
}

export interface UserManagementStats {
    totalUsers: number;
    activeUsers: number;
    bannedUsers: number;
    sellers: number;
}

export interface UserFilterOptions {
    role?: 'buyer' | 'seller' | 'admin';
    status?: 'active' | 'banned';
    searchQuery?: string;
    page?: number;
    limit?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
