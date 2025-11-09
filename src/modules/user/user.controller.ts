import { Request, Response } from "express";
import { UserService } from "./user.service";
import { ca } from "zod/v4/locales";

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

export const getAdByIdController = async (req: Request, res: Response) => {
    try {
        const adId = req.params.adId;
        if (!adId) return res.status(400).json({ message: "Ad ID is required" });
        const ad = await userService.getAdById(adId);
        return res.status(200).json({ message: "Advertisement fetched", advertisement: ad });
    } catch (error) {
        console.error("Error fetching advertisement:", error);
        return res.status(500).json({ message: "Failed to fetch advertisement", error: (error as Error).message });
    }
};

export const deleteAdListingController = async (req: Request, res: Response) => {
    try {
        const adminid = req.user?.id;
        if (!adminid) return res.status(403).json({ message: "Access denied" });
        const adId = req.params.adId;
        if (!adId) return res.status(400).json({ message: "Ad ID is required" });
        const deleted = await userService.deleteAdListing(adId);
        return res.status(200).json({ message: "Advertisement deleted", deleted });
    } catch (error) {
        console.error("Error deleting advertisement:", error);
        return res.status(500).json({ message: "Failed to delete advertisement", error: (error as Error).message });
    }
};

export const getAllAdListingsController = async (req: Request, res: Response) => {
    try {
        // optional filters
        const status = req.query.status as string | undefined;
        const adSpot = req.query.adSpot as string | undefined;
        const skip = req.query.skip ? parseInt(req.query.skip as string, 10) : undefined;
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

        const filter: any = {};
        if (status) filter.status = status;
        if (adSpot) filter.adSpot = adSpot;

        const ads = await userService.getAllAdListings(filter, { skip, limit });
        return res.status(200).json({ message: "Ad listings fetched", advertisements: ads });
    } catch (error) {
        console.error("Error fetching ad listings:", error);
        return res.status(500).json({ message: "Failed to fetch ad listings", error: (error as Error).message });
    }
};

// Public endpoints for frontend (no auth)
export const getPublicAdsController = async (req: Request, res: Response) => {
    try {
        // default to active ads for public listing
        const status = (req.query.status as string) || 'active';
        const adSpot = req.query.adSpot as string | undefined;
        const skip = req.query.skip ? parseInt(req.query.skip as string, 10) : undefined;
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

        const filter: any = { status };
        if (adSpot) filter.adSpot = adSpot;

        const ads = await userService.getAllAdListings(filter, { skip, limit });
        return res.status(200).json({ message: 'Public ad listings fetched', advertisements: ads });
    } catch (error) {
        console.error('Error fetching public ad listings:', error);
        return res.status(500).json({ message: 'Failed to fetch public ad listings', error: (error as Error).message });
    }
};

export const getPublicAdByIdController = async (req: Request, res: Response) => {
    try {
        const adId = req.params.adId;
        if (!adId) return res.status(400).json({ message: 'Ad ID is required' });
        const ad = await userService.getAdById(adId);
        // Only allow public access if ad is active (or keep as-is if admins call)
        if (!ad || (ad.status && ad.status !== 'active')) {
            return res.status(404).json({ message: 'Advertisement not found' });
        }
        return res.status(200).json({ message: 'Advertisement fetched', advertisement: ad });
    } catch (error) {
        console.error('Error fetching public advertisement:', error);
        return res.status(500).json({ message: 'Failed to fetch advertisement', error: (error as Error).message });
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

};


export const createAdListingController = async (req: Request, res: Response) => {
    try {
        const adminid = req.user?.id;
        if (!adminid) {
            return res.status(403).json({
                message: "Access denied"
            });
        }
        const adData = req.body
        // normalize adSpot (accept common variants and case-insensitive values)
        const rawAdSpot = (req.body.adSpot ?? req.body.AdSpot ?? "").toString();
        const normalizeAdSpot = (val: string) => {
            if (!val) return "";
            const key = val.toLowerCase().replace(/[^a-z]/g, "");
            switch (key) {
                case "homepagebanner":
                    return "homepageBanner";
                case "sidebar":
                    return "sidebar";
                case "footer":
                    return "footer";
                case "blogfeature":
                    return "blogFeature";
                default:
                    return "";
            }
        }
        const canonicalAdSpot = normalizeAdSpot(rawAdSpot);
        if (rawAdSpot && !canonicalAdSpot) {
            return res.status(400).json({
                message: "Invalid adSpot. Allowed values: homepageBanner, sidebar, footer, blogFeature",
                provided: rawAdSpot
            });
        }
        const imageUrls = req.files as Express.Multer.File[];
        if (!imageUrls || imageUrls.length === 0) {
            return res.status(400).json({
                message: "At least one image is required"
            });
        }
        const imagePaths = imageUrls.map(file => file.path);
        const adListingData = {
            ...adData,
            images: imagePaths,
            adminId: adminid,
            adSpot: canonicalAdSpot || adData.adSpot || adData.AdSpot
        };
        const newAdListing = await userService.createAdListing(adListingData);
        return res.status(201).json({
            message: "Advertisement listing created successfully",
            adListing: { ...newAdListing.adListing }
        });
    } catch (error) {
        console.error("Error creating advertisement listing:", error);

        return res.status(500).json({
            message: "Failed to create advertisement listing",
            error: (error as Error).message
        });
    }
}

export const changeAdStatusController = async (req: Request, res: Response) => {
    try {
        const adminid = req.user?.id;
        if (!adminid) {
            return res.status(403).json({
                message: "Access denied"
            });
        }
        const adId = req.params.adId;
        // Accept status either from URL param or request body for flexibility
        const status = (req.params.status as string) || (req.body && req.body.status);

        if (!adId || !status) {
            return res.status(400).json({
                message: "Ad ID and status are required"
            });
        }

        const result = await userService.changeAdStatus(adId, status, adminid);
        return res.status(200).json({
            message: "Advertisement status updated successfully",
            updatedAd: result
        });
    } catch (error) {

        console.error("Error changing advertisement status:", error);

        return res.status(500).json({
            message: "Failed to change advertisement status",
            error: (error as Error).message
        });
    }
}