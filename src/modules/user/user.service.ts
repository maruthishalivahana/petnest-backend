import { UserRepository } from "./user.repo";
import { IUser } from "../../database/models/user.model";
import { IAdListing } from "@database/models/adsLising.model";
import { AdListingSchema } from "@validations/adListing.validation";

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
        const pendingAds = await this.userRepo.findByIsActive();
        if (!pendingAds || pendingAds.length === 0) {
            throw new Error("No pending advertisements found as of now");
        }
        return pendingAds;
    }

    async createAdListing(adData: Partial<IAdListing> & { adRequestId?: string }) {
        const parseResult = AdListingSchema.safeParse(adData);
        if (!parseResult.success) {
            throw parseResult.error;
        }

        const adRequestIdStr = String(adData.adRequestId || (adData as any).advertisementId || "").trim();
        let request: (import("mongoose").Document & { isActive?: boolean; _id?: import("mongoose").Types.ObjectId; }) | null = null;
        if (adRequestIdStr) {
            request = await this.userRepo.findById(adRequestIdStr) as (import("mongoose").Document & { isActive?: boolean; _id?: import("mongoose").Types.ObjectId; }) | null;
            if (!request) {
                throw new Error("Advertisement request not found");
            }
        }

        const { title, description, images, adSpot, startDate, endDate } = parseResult.data as unknown as Partial<IAdListing> & Record<string, any>;

        if (!title || !images || !adSpot || !startDate || !endDate) {
            throw new Error("Missing required advertisement fields.");
        }

        const activeSpot = await this.userRepo.findActiveAdSpot(adSpot);
        // If an active ad exists in the spot, it is occupied and we should reject
        if (activeSpot) {
            throw new Error(`Ad spot "${adSpot}" is already occupied by an active advertisement.`);
        }

        // If an AdvertisementRequest was provided, mark it active and attach its id
        let advertisementIdToSave: any = undefined;
        if (request) {
            (request as any).isActive = true;
            await (request as any).save();
            advertisementIdToSave = request._id;
        }

        const newAdListing = await this.userRepo.createAdListing({
            title,
            images,
            description,
            adSpot,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            status: "active",
            adminId: (adData as any).adminId || (adData as any).AdminId || undefined,
            advertisementId: advertisementIdToSave
        });

        return {
            message: "Ad listing created",
            adListing: newAdListing.toObject()
        };
    }

    private static readonly ALLOWED_STATUS = ["active", "paused", "inactive", "expired", "rejected"] as const;

    async changeAdStatus(adListingId: string, status: string, adminId: string) {
        const allowed = UserService.ALLOWED_STATUS as readonly string[];
        if (!allowed.includes(status)) {
            throw new Error("Invalid status update request");
        }

        // Use the user repository which contains ad listing methods
        const ad = await this.userRepo.findByid(adListingId);
        if (!ad) throw new Error("Advertisement not found");

        // Business rule: cannot activate an already expired ad
        const adEnd = (ad as any).endDate ? new Date((ad as any).endDate) : null;
        if (status === "active" && adEnd && new Date() > adEnd) {
            throw new Error("Cannot activate ad after it has expired");
        }

        // If activating, ensure the adSpot is not occupied by a different active ad
        if (status === "active") {
            const occupied = await this.userRepo.findActiveAdSpot((ad as any).adSpot);
            if (occupied && String((occupied as any)._id) !== String((ad as any)._id)) {
                throw new Error(`Ad spot "${(ad as any).adSpot}" is already occupied by another active advertisement.`);
            }
        }

        const updated = await this.userRepo.updateAdListing(adListingId, { status, adminId, updatedAt: new Date() } as any);
        return updated;
    }

    // helper: expire ad if endDate passed
    private async expireIfNeeded(ad: any) {
        if (!ad) return null;
        try {
            const currentStatus = (ad as any).status;
            const end = (ad as any).endDate ? new Date((ad as any).endDate) : null;
            if (end && currentStatus !== "expired" && new Date() > end) {
                // mark expired
                const updated = await this.userRepo.updateAdListing(ad._id?.toString?.() || (ad as any).id, { status: "expired" } as any);
                return updated;
            }
            return ad;
        } catch (err) {
            // swallow and return original ad
            return ad;
        }
    }

    async getAdById(adListingId: string) {
        const ad = await this.userRepo.findByid(adListingId);
        if (!ad) throw new Error("Advertisement not found");
        const maybeUpdated = await this.expireIfNeeded(ad);
        return maybeUpdated;
    }

    async getAllAdListings(filter: Partial<IAdListing> = {}, options: { skip?: number; limit?: number } = {}) {
        const ads = await this.userRepo.findAllAdListings(filter, options);
        // expire any outdated ads
        const results = [] as any[];
        for (const a of ads) {
            // expireIfNeeded will update in DB if required and return current doc
            // if it updated, push updated doc, otherwise original
            // make best-effort without refetching whole collection
            // eslint-disable-next-line no-await-in-loop
            const updated = await this.expireIfNeeded(a);
            results.push(updated);
        }
        return results;
    }

    async deleteAdListing(adListingId: string) {
        const deleted = await this.userRepo.deleteAdListing(adListingId);
        if (!deleted) throw new Error("Advertisement not found or already deleted");
        return deleted;
    }

}
