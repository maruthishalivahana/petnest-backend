import { AdminRepository } from "./admin.repo";
import {
    SellerVerificationStats,
    PetVerificationStats,
    UserManagementStats,
    UserFilterOptions,
    PaginatedResponse
} from "./admin.types";

export class AdminService {
    private adminRepo: AdminRepository;

    constructor() {
        this.adminRepo = new AdminRepository();
    }

    // ============= SELLER VERIFICATION =============
    async getSellerVerificationStats(): Promise<SellerVerificationStats> {
        return await this.adminRepo.getSellerVerificationStats();
    }

    async getSellersByStatus(status: 'pending' | 'verified' | 'rejected') {
        const sellers = await this.adminRepo.getSellersByStatus(status);
        return sellers;
    }

    // ============= PET VERIFICATION =============
    async getPetVerificationStats(): Promise<PetVerificationStats> {
        return await this.adminRepo.getPetVerificationStats();
    }

    async getPendingPets() {
        return await this.adminRepo.getPetsByVerificationStatus(false, false);
    }

    async getApprovedPets() {
        return await this.adminRepo.getPetsByVerificationStatus(true, false);
    }

    async getRejectedPets() {
        return await this.adminRepo.getPetsByVerificationStatus(false, true);
    }

    // ============= USER MANAGEMENT =============
    async getUserManagementStats(): Promise<UserManagementStats> {
        return await this.adminRepo.getUserManagementStats();
    }

    async getFilteredUsers(options: UserFilterOptions): Promise<PaginatedResponse<any>> {
        return await this.adminRepo.getFilteredUsers(options);
    }

    async getUserDetails(userId: string) {
        const user = await this.adminRepo.getUserWithSellerInfo(userId);

        if (!user) {
            throw new Error("User not found");
        }

        return user;
    }

    // ============= SPECIES ANALYTICS =============
    async getSpeciesAnalytics() {
        return await this.adminRepo.getSpeciesAnalytics();
    }

    // ============= BREEDS ANALYTICS =============
    async getBreedsAnalytics() {
        return await this.adminRepo.getBreedsAnalytics();
    }
}
