export interface FeedQuery {
    // No filtering or pagination - returns all
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
