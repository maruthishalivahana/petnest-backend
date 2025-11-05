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
    name: z.string().min(1, {
        error: (issue) => {
            if (issue.code === 'too_small') {
                return 'Name is required';
            }
        }
    }),
    profilePic: z.string().url({
        error: () => 'Invalid URL format for profile picture'
    }).optional(),
    phoneNumber: z.string()
        .regex(/^\+?[\d\s\-()]+$/, {
            error: () => 'Invalid phone number format'
        })
        .min(10, {
            error: (issue) => {
                if (issue.code === 'too_small') {
                    return 'Phone number must be at least 10 digits long';
                }
            }
        }).optional(),
    bio: z.string().max(500, {
        error: (issue) => {
            if (issue.code === 'too_big') {
                return 'Bio must be at most 500 characters long';
            }
        }
    }).optional(),
    location: z.string().optional(),
    preferences: z.array(z.string()).optional(),

})

interface MulterFile extends Express.Multer.File {
    path: string;
}



export const UpdateBuyerProfile = async (req: Request, res: Response) => {
    try {
        const buyerId = req.user?.id;
        const profiledata = BuyerProfileSchema.parse(req.body);
        const user = await User.findOne({ _id: buyerId });
        const profilePicUrl = req.file ? (req.file as MulterFile).path : user?.profilePic;

        if (!buyerId) {
            return res.status(400).json({
                message: "invalid buyer id"
            })
        }


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


        const UpdatedFields: any = {
            name: profiledata.name,
            profilePic: profilePicUrl,
        }

        // if the optional fields are provided, add them to the update object else ignore and it does not store in DB as undefined
        if (profiledata.phoneNumber !== undefined) {
            UpdatedFields.phoneNumber = profiledata.phoneNumber;
        }
        if (profiledata.bio !== undefined) {
            UpdatedFields.bio = profiledata.bio;
        }
        if (profiledata.location !== undefined) {
            UpdatedFields.location = profiledata.location;
        }
        if (profiledata.preferences !== undefined) {
            UpdatedFields.preferences = profiledata.preferences;
        }


        const updatedUser = await User.findByIdAndUpdate({
            _id: buyerId
        }, {
            $set: {
                ...UpdatedFields
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

