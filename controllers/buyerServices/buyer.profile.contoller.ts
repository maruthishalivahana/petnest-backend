import { Request, Response } from 'express';
import User from "../../models/User";
import { z } from "zod";

//request body 
/**
 * name
 * email
 * profilepic
 * phonenumber
 * bio
 * location
 * preferences
 * isverified
 * 
 */

export const BuyerProfileSchema = z.object({
    name: z.string().min(1, "name is requires"),
    profilePic: z.string().url("invalid url").optional(),
    phoneNumber: z.string().min(10, "phone number must be at least 10 digits long").optional(),
    bio: z.string().max(500, "bio must be at most 500 characters long").optional(),
    location: z.string().optional(),
    preferences: z.array(z.string()).optional(),

})




export const UpdateBuyerProfile = async (req: Request, res: Response) => {
    try {
        const buyerId = req.user?.id;
        const profiledata = BuyerProfileSchema.parse(req.body);


        if (!buyerId) {
            return res.status(400).json({
                message: "invalid buyer id"
            })
        }

        const user = await User.findOne({ _id: buyerId });

        if (!user) {
            return res.status(404).json({
                message: "user not found"
            })
        }
        if (user.role !== 'buyer') {
            return res.status(403).json({
                message: "access denied"
            })
        }
        const profilePicUrl = req.file ? (req.file as any).path : user.profilePic;

        const updatedUser = await User.findByIdAndUpdate({
            _id: buyerId
        }, {
            $set: {
                name: profiledata.name,
                profilePic: profilePicUrl,
                phoneNumber: profiledata.phoneNumber,
                bio: profiledata.bio,
                location: profiledata.location,
                preferences: profiledata.preferences,
            }
        }, { new: true });

        return res.status(200).json({
            message: "buyer profile updated successfully",
            user: updatedUser
        })



    } catch (error) {
        console.error("Buyer profile update error:", error)
        return res.status(500).json({
            message: "oops! somthing want wrong",
            errors: (error as Error).message
        })

    }

}