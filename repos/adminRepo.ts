import Pet from "../models/Pet";
import User from "../models/User";
export const findUsers = async () => {
    return await User.find({});
};

export const deleteUserById = async (userId: string) => {
    return await User.findOneAndDelete({ _id: userId });
};

export const getAllnotverifyedpets = async () => {
    return await Pet.find({ isVerified: false });
}