// Re-export validation types
export type {
    SignupData,
    LoginData,
    VerifyOtpData,
    ResendOtpData
} from "../../validations/auth.validation";

// Additional auth-specific types
export interface AuthResponse {
    message: string;
    user?: any;
    token?: string;
    expiresIn?: string;
}

export interface LoginResponse {
    token: string;
    user: any;
}
