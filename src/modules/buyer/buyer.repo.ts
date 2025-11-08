import User from "../../database/models/user.model";

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
}
