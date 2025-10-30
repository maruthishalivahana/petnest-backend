import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "my_super_secret_key_123";

interface ISignUpData {
    name: string;
    email: string;
    password: string;
    role: "buyer" | "seller" | "admin";
}

interface ILoginData {
    email: string;
    password: string;
}
export const signUp = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role } = req.body as ISignUpData;
        const exitUser = await User.findOne({ email });
        const hashedPassword = await bcrypt.hash(password, 10)
        if (exitUser) {
            return res.status(400).json({
                message: "User already exists",
                user: exitUser
            })
        }
        const newuser = new User({
            name,
            email,
            password: hashedPassword,
            role
        })

        const saveduser = await newuser.save()
        const jwtToken = jwt.sign({
            id: saveduser._id,
            role: saveduser.role
        }, JWT_SECRET, { expiresIn: '7d' })

        // this code removes password from the user object before sending response

        const { password: _, ...userData } = saveduser.toObject();
        return res.status(201).json({
            message: "User created successfully",
            user: userData,
            token: jwtToken,
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "oops! something went wrong!", error: error.message

        })
    }

}



