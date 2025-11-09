import { adUserRepository } from "./adduser.repo"
import { IAdvertisement } from "../../database/models/adsRequest.model";
import { AdRequestSchema } from "@validations/ad.validation";

export class AdUserService {
    private adUserRepo: adUserRepository;
    constructor() {
        this.adUserRepo = new adUserRepository();
    }

    async requestAdvisement(adData: Partial<IAdvertisement>) {
        try {
            if (!adData) {
                throw new Error("Advertisement data is required");
            }
            const adSafeData = AdRequestSchema.safeParse(adData);
            if (!adSafeData.success) {
                throw adSafeData.error;
            }

            return this.adUserRepo.requestAdvisement(adSafeData.data);


        } catch (error: any) {
            console.error("Error requesting advertisement:", error);
            throw new Error("Error requesting advertisement: " + error.message);
        }
    }
}