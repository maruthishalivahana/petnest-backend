import { getAllnotverifyedpets } from "../../repos/adminRepo";
export const getAllnotVerifiedPetsService = async () => {
    const notVerifiedPets = await getAllnotverifyedpets();
    if (!notVerifiedPets || notVerifiedPets.length === 0) {
        throw new Error("No unverified pets found");
    }

    return notVerifiedPets;
}   
