import { Request, Response } from "express";
import { AdminService } from "./admin.service";

const adminService = new AdminService();

// ============= SELLER VERIFICATION =============
export const getSellerVerificationStatsController = async (req: Request, res: Response) => {
    try {
        const stats = await adminService.getSellerVerificationStats();

        return res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error: any) {
        console.error("Error fetching seller verification stats:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch seller verification stats",
            error: error.message
        });
    }
};

export const getSellersByStatusController = async (req: Request, res: Response) => {
    try {
        const { status } = req.params;

        if (!['pending', 'verified', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be 'pending', 'verified', or 'rejected'"
            });
        }

        const sellers = await adminService.getSellersByStatus(status as 'pending' | 'verified' | 'rejected');

        return res.status(200).json({
            success: true,
            count: sellers.length,
            data: sellers
        });
    } catch (error: any) {
        console.error("Error fetching sellers by status:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch sellers",
            error: error.message
        });
    }
};

// ============= PET VERIFICATION =============
export const getPetVerificationStatsController = async (req: Request, res: Response) => {
    try {
        const stats = await adminService.getPetVerificationStats();

        return res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error: any) {
        console.error("Error fetching pet verification stats:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch pet verification stats",
            error: error.message
        });
    }
};

export const getPetsByVerificationStatusController = async (req: Request, res: Response) => {
    try {
        const { status } = req.params;

        let pets;
        switch (status) {
            case 'pending':
                pets = await adminService.getPendingPets();
                break;
            case 'approved':
                pets = await adminService.getApprovedPets();
                break;
            case 'rejected':
                pets = await adminService.getRejectedPets();
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: "Invalid status. Must be 'pending', 'approved', or 'rejected'"
                });
        }

        return res.status(200).json({
            success: true,
            count: pets.length,
            data: pets
        });
    } catch (error: any) {
        console.error("Error fetching pets by verification status:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch pets",
            error: error.message
        });
    }
};

// ============= USER MANAGEMENT =============
export const getUserManagementStatsController = async (req: Request, res: Response) => {
    try {
        const stats = await adminService.getUserManagementStats();

        return res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error: any) {
        console.error("Error fetching user management stats:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch user management stats",
            error: error.message
        });
    }
};

export const getFilteredUsersController = async (req: Request, res: Response) => {
    try {
        const { role, status, searchQuery, page, limit } = req.query;

        const options: any = {
            page: page ? parseInt(page as string) : 1,
            limit: limit ? parseInt(limit as string) : 10
        };

        if (role) options.role = role;
        if (status) options.status = status;
        if (searchQuery) options.searchQuery = searchQuery;

        const result = await adminService.getFilteredUsers(options);

        return res.status(200).json({
            success: true,
            ...result
        });
    } catch (error: any) {
        console.error("Error fetching filtered users:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch users",
            error: error.message
        });
    }
};

export const getUserDetailsController = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        const user = await adminService.getUserDetails(userId);

        return res.status(200).json({
            success: true,
            data: user
        });
    } catch (error: any) {
        console.error("Error fetching user details:", error);

        if (error.message === "User not found") {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to fetch user details",
            error: error.message
        });
    }
};

// ============= SPECIES ANALYTICS =============
export const getSpeciesAnalyticsController = async (req: Request, res: Response) => {
    try {
        const analytics = await adminService.getSpeciesAnalytics();

        return res.status(200).json({
            success: true,
            count: analytics.length,
            data: analytics
        });
    } catch (error: any) {
        console.error("Error fetching species analytics:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch species analytics",
            error: error.message
        });
    }
};

// ============= BREEDS ANALYTICS =============
export const getBreedsAnalyticsController = async (req: Request, res: Response) => {
    try {
        const analytics = await adminService.getBreedsAnalytics();

        return res.status(200).json({
            success: true,
            count: analytics.length,
            data: analytics
        });
    } catch (error: any) {
        console.error("Error fetching breeds analytics:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch breeds analytics",
            error: error.message
        });
    }
};
