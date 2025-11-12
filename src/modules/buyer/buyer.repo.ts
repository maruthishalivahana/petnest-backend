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
        return await Pet.find({});
    }

    async addToWishlist(buyerId: string, petId: string) {
        const wishlistItem = new Wishlist({ buyerId, petId });
        return await wishlistItem.save();
    }

    async findOne(buyerId: string, petId: string) {
        return await Wishlist.findOne({ buyerId, petId });
    }
    async findById(id: string) {
        return await Pet.findById(id);
    }
    async removeFromWishlist(buyerId: string, petId: string) {
        return await Wishlist.findOneAndDelete({ buyerId, petId });
    }
    async getWishList(buyerId: string) {
        return await Wishlist.find({ buyerId }).populate("petId", "name price gender images isVerified status");
    }

    async searchPets(keyword?: string) {
        const query: any = { status: 'active' };
        if (keyword && keyword.trim() !== '') {
            query.$or = [
                { name: { $regex: keyword, $options: 'i' } },
                { breedName: { $regex: keyword, $options: 'i' } },
                { 'location.city': { $regex: keyword, $options: 'i' } },
                { 'location.state': { $regex: keyword, $options: 'i' } },
                { 'location.pincode': { $regex: keyword, $options: 'i' } }
            ];
        }

        // 🐶 Return matching pets or all active pets if no keyword
        return await Pet.find(query)
            .populate('breedId', 'name')
            .populate('sellerId', 'name email')
            .sort({ createdAt: -1 });
    }
    async filterpets(filters: PetFilter) {
        const query: any = { status: 'active' };
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
            .sort({ createdAt: -1 });
    }
}