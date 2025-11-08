// User module types
export interface UserResponse {
    message: string;
    user?: any;
    users?: any[];
}

export interface DeleteUserResponse {
    message: string;
}

export type UserRole = "buyer" | "seller" | "admin";
