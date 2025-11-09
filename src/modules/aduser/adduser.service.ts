import { adUserRepository } from "./adduser.repo"


export class AdUserService {
    private adUserRepo: adUserRepository;
    constructor() {
        this.adUserRepo = new adUserRepository();
    }

    async requestAdvisement(adData: Partial<any>) {
        try {
            if (!adData) {
                throw new Error("Advertisement data is required");
            }

            return this.adUserRepo.requestAdvisement(adData);


        } catch (error: any) {
            console.error("Error requesting advertisement:", error);
            throw new Error("Error requesting advertisement: " + error.message);
        }
    }
}