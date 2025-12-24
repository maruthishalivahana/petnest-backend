import { SellerRepository } from "./seller.repo";
import { SellerRequestDataSchema, SellerRequestFullData } from "../../validations/seller.validation";

export class SellerService {
    private sellerRepo: SellerRepository;

    constructor() {
        this.sellerRepo = new SellerRepository();
    }

    async createSellerRequest(
        body: any,
        userId: string,
        files: { [fieldname: string]: Express.Multer.File[] }
    ) {
        try {
            const existingRequest = await this.sellerRepo.findSellerByUserId(userId);

            // Validate the body data (without documents)
            const validationResult = SellerRequestDataSchema.safeParse(body);
            if (!validationResult.success) {
                throw validationResult.error;
            }

            const safeData = validationResult.data;

            if (existingRequest && existingRequest.status === "pending") {
                throw new Error("Your request is under pending review. Wait for admin response!");
            }

            if (existingRequest && existingRequest.status === "verified") {
                throw new Error("You are already an approved seller.");
            }

            // Extract Cloudinary URLs from uploaded files
            const idProofUrl = files?.idProof?.[0]?.path;
            const certificateUrl = files?.certificate?.[0]?.path;
            const shopImageUrl = files?.shopImage?.[0]?.path;

            // Validate that required files are uploaded
            if (!idProofUrl || !certificateUrl) {
                throw new Error("ID proof and certificate are required");
            }

            // Create the full seller request data
            const fullRequestData: SellerRequestFullData = {
                ...safeData,
                userId: userId,
                documents: {
                    idProof: idProofUrl,
                    certificate: certificateUrl,
                    shopImage: shopImageUrl,
                },
                verificationDate: undefined,
                verificationNotes: undefined,
            };

            // Create seller request
            const newSellerRequest = await this.sellerRepo.createSellerRequest(fullRequestData as any);

            return newSellerRequest;
        } catch (error) {
            throw error;
        }
    }

    async verifySellerRequest(
        sellerRequestId: string,
        status: 'pending' | 'verified' | 'rejected' | 'suspended',
        notes?: string
    ) {
        const allowed = ["pending", "verified", "rejected", "suspended"];
        if (!allowed.includes(status)) {
            throw new Error("Invalid status value");
        }

        const sellerRequest = await this.sellerRepo.findSellerById(sellerRequestId);
        if (!sellerRequest) {
            throw new Error("Seller request not found");
        }

        if (sellerRequest.status === "verified" && status === "verified") {
            throw new Error("Seller is already verified.");
        }

        if (sellerRequest.status === "rejected" && status === "rejected") {
            throw new Error("Seller request is already rejected.");
        }

        if (sellerRequest.status === "verified" && status === "rejected") {
            throw new Error("You cannot reject a seller who is already verified.");
        }

        if (status === "pending") {
            throw new Error("Admin cannot set seller request to pending.");
        }

        // Update seller status
        const updatedSeller = await this.sellerRepo.updateSellerStatus(sellerRequestId, status, notes);

        // If verified, update user role to seller
        if (status === "verified" && updatedSeller) {
            await this.sellerRepo.updateUserRoleToSeller(String(updatedSeller.userId));
        }

        return updatedSeller;
    }

    async getPendingSellerRequests() {
        const pendingRequests = await this.sellerRepo.findPendingSellerRequests();

        if (!pendingRequests || pendingRequests.length === 0) {
            throw new Error("No pending seller requests found");
        }

        return pendingRequests;
    }

    async getSellerById(sellerId: string) {
        const seller = await this.sellerRepo.findSellerById(sellerId);

        if (!seller) {
            throw new Error("Seller not found");
        }

        return seller;
    }

    async getAllVerifiedSellers() {
        return await this.sellerRepo.findAllVerifiedSellers();
    }

    async getSellerDetails(sellerId: string) {
        const seller = await this.sellerRepo.findSellerById(sellerId);

        if (!seller) {
            throw new Error("Seller not found");
        }

        if (seller.status !== "verified") {
            throw new Error("Seller is not verified");
        }

        return seller;
    }

    async getMySellerProfile(userId: string) {
        const seller = await this.sellerRepo.findSellerByUserId(userId);

        if (!seller) {
            throw new Error("Seller profile not found");
        }

        return seller;
    }
}
