import { Request, Response } from 'express';
import User from "../../models/User";
import { z } from "zod";


//request body 
/**
 * name:string
 * email:string
 * profilepic:url
 * phonenumber:string
 * bio:string
 * location:string
 * preferences:string[]
 * isverified:boolean
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
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: "Validation failed",
                errors: error.issues
            });
        }
        return res.status(500).json({
            message: "Oops! Something went wrong",
            ...(process.env.NODE_ENV === 'development' && {
                error: (error as Error).message
            })
        });


    }

}

