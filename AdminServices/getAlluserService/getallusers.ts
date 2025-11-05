import { findUsers } from "../../repos/adminRepo";
export const getAllUsersService = async () => {
    try {
        const users = await findUsers();
        if (!users || users.length === 0) {
            throw new Error("No users found");
        }
        return users;
    } catch (error) {
        console.error("Error fetching users:", error);
        throw new Error("Failed to fetch users");
    }
}