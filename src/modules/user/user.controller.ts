import { Request, Response } from "express";
import { UserService } from "./user.service";

const userService = new UserService();

export const getAllUsersController = async (req: Request, res: Response) => {
    try {
        const users = await userService.getAllUsers();

        return res.status(200).json({
            message: "Users fetched successfully",
            users: users
        });
    } catch (error: any) {
        console.error("Error fetching users:", error);

        if (error.message === "No users found") {
            return res.status(404).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Failed to fetch users",
            error: error.message
        });
    }
};

export const getUserByIdController = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                message: "User ID is required"
            });
        }

        const user = await userService.getUserById(userId);

        return res.status(200).json({
            message: "User fetched successfully",
            user: user
        });
    } catch (error: any) {
        console.error("Error fetching user:", error);

        if (error.message === "User not found") {
            return res.status(404).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Failed to fetch user",
            error: error.message
        });
    }
};

export const deleteuserByIdController = async (req: Request, res: Response) => {
    try {
        const adminId = req.user?.id;

        if (!adminId) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                message: "Invalid user id"
            });
        }

        await userService.deleteUser(userId);

        return res.status(200).json({
            message: "User deleted successfully"
        });
    } catch (error: any) {
        console.error("Error deleting user:", error);

        if (error.message === "User not found or already deleted") {
            return res.status(404).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

export const getUsersByRoleController = async (req: Request, res: Response) => {
    try {
        const { role } = req.params;

        if (!role || !["buyer", "seller", "admin"].includes(role)) {
            return res.status(400).json({
                message: "Valid role is required (buyer, seller, or admin)"
            });
        }

        const users = await userService.getUsersByRole(role as "buyer" | "seller" | "admin");

        return res.status(200).json({
            message: `${role}s fetched successfully`,
            users: users
        });
    } catch (error: any) {
        console.error("Error fetching users by role:", error);

        if (error.message.includes("not found")) {
            return res.status(404).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Failed to fetch users",
            error: error.message
        });
    }
};

export const banUserController = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                message: "User ID is required"
            });
        }

        const result = await userService.banUser(userId);

        return res.status(200).json(result);
    } catch (error: any) {
        console.error("Error banning user:", error);

        if (error.message === "User not found") {
            return res.status(404).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Failed to ban user",
            error: error.message
        });
    }
};

export const unbanUserController = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                message: "User ID is required"
            });
        }

        const result = await userService.unbanUser(userId);

        return res.status(200).json(result);
    } catch (error: any) {
        console.error("Error unbanning user:", error);

        if (error.message === "User not found") {
            return res.status(404).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Failed to unban user",
            error: error.message
        });
    }
};

export const getAllAdvertisementsController = async (req: Request, res: Response) => {
    try {
        const ads = await userService.getAllAdvertisements();

        return res.status(200).json({
            message: "Advertisements fetched successfully",
            advertisements: ads
        });

    } catch (error) {
        console.error("Error fetching advertisements:", error);

        return res.status(500).json({
            message: "Failed to fetch advertisements",
            error: (error as Error).message
        });

    }
}

export const getAllPendingAdvertisementsController = async (req: Request, res: Response) => {
    try {
        const status = req.params.status;
        const RequestedAds = await userService.getallPendingAdvertisiments();
        if (!RequestedAds) {
            return res.status(404).json({
                message: `No advertisements found with status: ${status}`
            });
        }
        return res.status(200).json({
            message: "Advertisements fetched successfully",
            advertisements: RequestedAds
        });

    } catch (error) {
        console.error("Error fetching advertisements by status:", error);

        return res.status(500).json({
            message: "Failed to fetch advertisements",
            error: (error as Error).message
        });


    }
}
