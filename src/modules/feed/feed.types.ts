export interface FeedQuery {
    page?: number;
    limit?: number;
    device?: 'mobile' | 'desktop' | 'both';
    species?: string;
    breed?: string;
}

export interface FeedItem {
    type: 'pet' | 'ad';
    data: any;
}

export interface FeedResponse {
    success: boolean;
    data: FeedItem[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
