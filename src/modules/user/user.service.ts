import { UserRepository } from "./user.repo";
import { IUser } from "../../database/models/user.model";

export class UserService {
    private userRepo: UserRepository;

    constructor() {
        this.userRepo = new UserRepository();
    }

    async getAllUsers() {
        const users = await this.userRepo.findAllUsers();

        if (!users || users.length === 0) {
            throw new Error("No users found");
        }

        // Remove sensitive data
        return users.map(user => {
            const { password, otpCode, ...userData } = user.toObject();
            return userData;
        });
    }

    async getUserById(userId: string) {
        const user = await this.userRepo.findUserById(userId);

        if (!user) {
            throw new Error("User not found");
        }

        const { password, otpCode, ...userData } = user.toObject();
        return userData;
    }

    async deleteUser(userId: string) {
        const deletedUser = await this.userRepo.deleteUserById(userId);

        if (!deletedUser) {
            throw new Error("User not found or already deleted");
        }

        return {
            message: "User deleted successfully"
        };
    }

    async getUsersByRole(role: "buyer" | "seller" | "admin") {
        const users = await this.userRepo.findUsersByRole(role);

        if (!users || users.length === 0) {
            throw new Error(`No ${role}s found`);
        }

        return users.map(user => {
            const { password, otpCode, ...userData } = user.toObject();
            return userData;
        });
    }

    async banUser(userId: string) {
        const user = await this.userRepo.banUser(userId);

        if (!user) {
            throw new Error("User not found");
        }

        return {
            message: "User banned successfully",
            user: user.toObject()
        };
    }

    async unbanUser(userId: string) {
        const user = await this.userRepo.unbanUser(userId);

        if (!user) {
            throw new Error("User not found");
        }

        return {
            message: "User unbanned successfully",
            user: user.toObject()
        };
    }

    async getAllAdvertisements() {
        const ads = await this.userRepo.getAllAdvertisements();
        if (!ads || ads.length === 0) {
            throw new Error("No advertisements found");
        }
        return ads;
    }
    async getallPendingAdvertisiments() {
        const pendingAds = await this.userRepo.getPendingAdvertisements();
        if (!pendingAds || pendingAds.length === 0) {
            throw new Error("No pending advertisements found as of now");
        }
        return pendingAds;
    }

}
