import User from "../models/User";

export const findBuyerById = async (buyerId: string) => {
    return await User.findOne({ _id: buyerId, role: 'buyer' });
}


export const updateBuyerById = async (buyerId: string, updateData: any) => {
    return await User.findByIdAndUpdate(buyerId, { $set: updateData }, { new: true });
}

