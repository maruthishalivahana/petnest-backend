import User from "@database/models/user.model";
import Seller from "@database/models/seller.model";
import Pet from "@database/models/pet.model";
import Species from "@database/models/species.model";
import Breed from "@database/models/breed.model";
import { UserFilterOptions } from "./admin.types";

export class AdminRepository {
    // ============= SELLER VERIFICATION =============
    async getSellerVerificationStats() {
        const [pending, approved, rejected] = await Promise.all([
            Seller.countDocuments({ status: 'pending' }),
            Seller.countDocuments({ status: 'verified' }),
            Seller.countDocuments({ status: 'rejected' })
        ]);

        return { pending, approved, rejected };
    }

    async getSellersByStatus(status: 'pending' | 'verified' | 'rejected') {
        return await Seller.find({ status })
            .populate('userId', 'name email profilePic createdAt')
            .sort({ createdAt: -1 })
            .lean();
    }

    // ============= PET VERIFICATION =============
    async getPetVerificationStats() {
        const [pending, approved, rejected] = await Promise.all([
            Pet.countDocuments({ isVerified: false, status: { $ne: 'rejected' } }),
            Pet.countDocuments({ isVerified: true }),
            Pet.countDocuments({ status: 'rejected' })
        ]);

        return { pending, approved, rejected };
    }

    async getPetsByVerificationStatus(isVerified: boolean, includeRejected: boolean = false) {
        const query: any = { isVerified };
        if (!isVerified && !includeRejected) {
            query.status = { $ne: 'rejected' };
        } else if (includeRejected) {
            query.status = 'rejected';
        }

        return await Pet.find(query)
            .populate('sellerId', 'brandName logoUrl')
            .populate('breedId', 'name')
            .sort({ createdAt: -1 })
            .lean();
    }

    // ============= USER MANAGEMENT =============
    async getUserManagementStats() {
        const [totalUsers, bannedUsers, sellers] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ isBanned: true }),
            User.countDocuments({ role: 'seller' })
        ]);

        const activeUsers = totalUsers - bannedUsers;

        return { totalUsers, activeUsers, bannedUsers, sellers };
    }

    async getFilteredUsers(options: UserFilterOptions) {
        const { role, status, searchQuery, page = 1, limit = 10 } = options;

        const query: any = {};

        if (role) {
            query.role = role;
        }

        if (status === 'banned') {
            query.isBanned = true;
        } else if (status === 'active') {
            query.isBanned = false;
        }

        if (searchQuery) {
            query.$or = [
                { name: { $regex: searchQuery, $options: 'i' } },
                { email: { $regex: searchQuery, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            User.find(query)
                .select('-password -otpCode -otpExpiry')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            User.countDocuments(query)
        ]);

        return {
            data: users,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    async getUserWithSellerInfo(userId: string) {
        const user = await User.findById(userId)
            .select('-password -otpCode -otpExpiry')
            .lean();

        if (!user) return null;

        if (user.role === 'seller') {
            const sellerInfo = await Seller.findOne({ userId }).lean();
            return { ...user, sellerInfo };
        }

        return user;
    }

    // ============= SPECIES ANALYTICS =============
    async getSpeciesAnalytics() {
        try {
            // First get all species
            const speciesList = await Species.find({}).lean();

            // Get breed counts per species
            const breedCounts = await Breed.aggregate([
                {
                    $group: {
                        _id: '$species',
                        count: { $sum: 1 }
                    }
                }
            ]);

            // Get pet counts per species (via breed relationship)
            const petStats = await Pet.aggregate([
                {
                    $lookup: {
                        from: 'breeds',
                        localField: 'breedId',
                        foreignField: '_id',
                        as: 'breed'
                    }
                },
                {
                    $unwind: { path: '$breed', preserveNullAndEmptyArrays: false }
                },
                {
                    $group: {
                        _id: '$breed.species',
                        totalListings: { $sum: 1 },
                        verifiedListings: {
                            $sum: { $cond: [{ $eq: ['$isVerified', true] }, 1, 0] }
                        },
                        pendingListings: {
                            $sum: { $cond: [{ $eq: ['$isVerified', false] }, 1, 0] }
                        }
                    }
                }
            ]);

            // Create lookup maps
            const breedCountMap = new Map(breedCounts.map(b => [String(b._id), b.count]));
            const petStatsMap = new Map(petStats.map(p => [String(p._id), p]));

            // Combine data
            const analytics = speciesList.map(species => {
                const speciesId = String(species._id);
                const stats = petStatsMap.get(speciesId) || { totalListings: 0, verifiedListings: 0, pendingListings: 0 };

                return {
                    _id: species._id,
                    name: species.speciesName,
                    totalBreeds: breedCountMap.get(speciesId) || 0,
                    totalListings: stats.totalListings,
                    verifiedListings: stats.verifiedListings,
                    pendingListings: stats.pendingListings
                };
            });

            // Sort alphabetically by name
            analytics.sort((a, b) => a.name.localeCompare(b.name));

            return analytics;
        } catch (error: any) {
            console.error('Error in getSpeciesAnalytics:', error);
            throw new Error('Error fetching species analytics: ' + error.message);
        }
    }

    // ============= BREEDS ANALYTICS =============
    async getBreedsAnalytics() {
        try {
            const analytics = await Breed.aggregate([
                {
                    // Lookup species information
                    $lookup: {
                        from: 'speciesregulations',
                        localField: 'species',
                        foreignField: '_id',
                        as: 'speciesInfo'
                    }
                },
                {
                    $unwind: { path: '$speciesInfo', preserveNullAndEmptyArrays: true }
                },
                {
                    // Lookup pets for each breed
                    $lookup: {
                        from: 'pets',
                        localField: '_id',
                        foreignField: 'breedId',
                        as: 'pets'
                    }
                },
                {
                    // Calculate statistics
                    $project: {
                        _id: 1,
                        name: 1,
                        species: {
                            _id: '$speciesInfo._id',
                            name: '$speciesInfo.speciesName'
                        },
                        totalListings: { $size: '$pets' },
                        verifiedListings: {
                            $sum: {
                                $map: {
                                    input: '$pets',
                                    as: 'pet',
                                    in: { $cond: [{ $eq: ['$$pet.isVerified', true] }, 1, 0] }
                                }
                            }
                        },
                        pendingListings: {
                            $sum: {
                                $map: {
                                    input: '$pets',
                                    as: 'pet',
                                    in: { $cond: [{ $eq: ['$$pet.isVerified', false] }, 1, 0] }
                                }
                            }
                        }
                    }
                },
                {
                    // Sort alphabetically by breed name
                    $sort: { name: 1 }
                }
            ]);

            return analytics;
        } catch (error: any) {
            console.error('Error in getBreedsAnalytics:', error);
            throw new Error('Error fetching breeds analytics: ' + error.message);
        }
    }
}
