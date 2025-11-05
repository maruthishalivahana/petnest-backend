import { deleteUserById } from "../../repos/adminRepo";
export const deleteuserByIdService = async (userId: string) => {
    try {
        const deletedUser = await deleteUserById(userId);
        if (!deletedUser) {
            throw new Error("User not found or already deleted");
        }
    } catch (error) {
        throw new Error("something went wrong");
    }



}
