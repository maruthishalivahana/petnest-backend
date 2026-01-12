import User from "../../database/models/user.model";
import Pet from "@database/models/pet.model";
import Wishlist from "@database/models/wishlist.model";
import { PetFilter } from "./buyer.types";

export class BuyerRepository {
    /**
     * Find a buyer by ID
     */
    async findBuyerById(buyerId: string) {
        return await User.findOne({ _id: buyerId, role: 'buyer' });
    }

    /**
     * Update buyer profile by ID
     */
    async updateBuyerById(buyerId: string, updateData: any) {
        return await User.findByIdAndUpdate(
            buyerId,
            { $set: updateData },
            { new: true }
        );
    }
    async findAllPets() {
        return await Pet.find({
            $or: [
                { 'featuredRequest.status': { $exists: false } },
                { 'featuredRequest.status': { $ne: 'approved' } }
            ]
        })
            .populate({
                path: "breedId",
                select: "name species", // Only fetch needed fields
                populate: {
                    path: "species",
                    select: "name category"
                }
            })
            .populate({
                path: "sellerId",
                select: "brandName userId", // Only fetch needed fields
                populate: {
                    path: "userId",
                    select: "name"
                }
            })
            .select('-__v') // Exclude version key
            .lean(); // Return plain JS objects (faster)
    }

    /**
     * ============= NEW CART-STYLE WISHLIST METHODS =============
     * Using single document per user with items array
     * Provides better performance, security, and scalability
     */

    /**
     * Add pet to user's wishlist
     * SECURITY: Uses $addToSet to prevent duplicates and ensures user-level isolation
     * Creates wishlist document if it doesn't exist
     */
    async addToWishlist(userId: string, petId: string) {
        return await Wishlist.findOneAndUpdate(
            { user: userId },
            {
                $addToSet: {
                    items: {
                        pet: petId,
                        addedAt: new Date()
                    }
                }
            },
            {
                upsert: true,  // Create document if doesn't exist
                new: true,     // Return updated document
                setDefaultsOnInsert: true
            }
        );
    }

    /**
     * Remove pet from user's wishlist
     * SECURITY: Only modifies the authenticated user's wishlist
     */
    async removeFromWishlist(userId: string, petId: string) {
        return await Wishlist.findOneAndUpdate(
            { user: userId },
            {
                $pull: {
                    items: { pet: petId }
                }
            },
            { new: true }
        );
    }

    /**
     * Get user's complete wishlist with populated pet details
     * SECURITY: Only returns the authenticated user's wishlist
     */
    async getWishlist(userId: string) {
        return await Wishlist.findOne({ user: userId })
            .populate({
                path: 'items.pet',
                select: 'name price gender images isVerified status breedName location'
            })
            .lean();
    }

    /**
     * Check if a specific pet is in user's wishlist
     * SECURITY: Fast compound index query, user-isolated
     * Returns true if pet exists in user's wishlist, false otherwise
     */
    async isWishlisted(userId: string, petId: string): Promise<boolean> {
        const result = await Wishlist.findOne(
            { user: userId, 'items.pet': petId },
            { _id: 1 } // Only return _id for performance
        ).lean();

        return !!result;
    }

    /**
     * Get all wishlist pet IDs for a user (for batch operations)
     * SECURITY: Only returns the authenticated user's wishlist pet IDs
     */
    async getWishlistPetIds(userId: string): Promise<string[]> {
        const wishlist = await Wishlist.findOne(
            { user: userId },
            { 'items.pet': 1 }
        ).lean();

        if (!wishlist || !wishlist.items) {
            return [];
        }

        return wishlist.items.map((item: any) => String(item.pet));
    }

    /**
     * Find pet by ID (no user context needed - public pet data)
     */
    async findById(id: string) {
        return await Pet.findById(id)
            .populate({
                path: 'breedId',
                select: 'name species',
                populate: {
                    path: 'species',
                    select: 'speciesName category scientificName'
                }
            })
            .populate({
                path: 'sellerId',
                select: 'brandName logoUrl location whatsappNumber'
            })
            .lean();
    }

    async searchPets(keyword?: string) {
        const query: any = {
            status: 'active',
            $or: [
                { 'featuredRequest.status': { $exists: false } },
                { 'featuredRequest.status': { $ne: 'approved' } }
            ]
        };

        if (keyword && keyword.trim() !== '') {
            const num = Number(keyword);

            const searchConditions: any[] = [
                { name: { $regex: keyword, $options: 'i' } },
                { breedName: { $regex: keyword, $options: 'i' } },
                { 'location.city': { $regex: keyword, $options: 'i' } },
                { 'location.state': { $regex: keyword, $options: 'i' } },
                { 'location.pincode': { $regex: keyword, $options: 'i' } }
            ];

            if (!isNaN(num)) {
                searchConditions.push({ price: num });
            }

            // Merge featured filter with search conditions using $and
            query.$and = [
                {
                    $or: [
                        { 'featuredRequest.status': { $exists: false } },
                        { 'featuredRequest.status': { $ne: 'approved' } }
                    ]
                },
                { $or: searchConditions }
            ];
            delete query.$or;
        }

        return await Pet.find(query)
            .populate('breedId', 'name')
            .populate('sellerId', 'name email')
            .sort({ createdAt: -1 })
            .lean();
    }

    async filterpets(filters: PetFilter) {
        const query: any = {
            status: 'active',
            $or: [
                { 'featuredRequest.status': { $exists: false } },
                { 'featuredRequest.status': { $ne: 'approved' } }
            ]
        };
        const { gender, age, city, state, minPrice, maxPrice, breedName } = filters

        if (gender) { query.gender = gender; }
        if (age) { query.age = age; }
        if (city) { query['location.city'] = city; }
        if (state) { query['location.state'] = state; }
        if (minPrice !== undefined) { query.price = { ...query.price, $gte: minPrice }; }
        if (maxPrice !== undefined) { query.price = { ...query.price, $lte: maxPrice }; }
        if (breedName) { query.breedName = breedName; }


        return await Pet.find(query)
            .populate('breedId', 'name')
            .populate('sellerId', 'name email')
            .sort({ createdAt: -1 })
            .lean();
    }
}