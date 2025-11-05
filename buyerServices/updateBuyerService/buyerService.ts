import { BuyerProfileSchema } from "../../validations/buyerService";
import { findBuyerById, updateBuyerById } from "../../repos/buyerRepo";



interface MulterFile extends Express.Multer.File {
    path: string;
}
const updateBuyerProfileService = async (buyerId: string, body: any, file?: MulterFile) => {
    try {
        const profileData = BuyerProfileSchema.parse(body);
        const user = await findBuyerById(buyerId);
        if (!user) {
            throw new Error("User not found");
        }
        if (user.role !== 'buyer') {
            throw new Error("Access denied");
        }
        const profilePicUrl = file ? file.path : user?.profilePic;
        const updatedFields: any = {
            name: profileData.name,
            profilePic: profilePicUrl,
        }
        if (profileData.phoneNumber !== undefined) {
            updatedFields.phoneNumber = profileData.phoneNumber;
        }
        if (profileData.bio !== undefined) {
            updatedFields.bio = profileData.bio;
        }
        if (profileData.location !== undefined) {
            updatedFields.location = profileData.location;
        }
        if (profileData.preferences !== undefined) {
            updatedFields.preferences = profileData.preferences;
        }

        const updatedUser = await updateBuyerById(buyerId, updatedFields);
        return updatedUser;
    } catch (error) {
        console.error("Error updating buyer profile:", error);
        throw error;
    }
}
export default updateBuyerProfileService;

// export const getBuyerProfileService = async (buyerId: string) => {
//     try {

//     } catch (error) {

//     }
// }