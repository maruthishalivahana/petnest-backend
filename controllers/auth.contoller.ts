import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";
import jwt from "jsonwebtoken";
import { SignupSchema, LoginSchema } from "../validations/authdata.validation";
import { SignupData, LoginData } from "../validations/authdata.validation";

import { zodErrorFormatter } from "../utils/zodError";
const JWT_SECRET = process.env.JWT_SECRET || "my_super_secret_key_123";

interface ILoginData {
    email: string;
    password: string;
}
export const signUp = async (req: Request, res: Response) => {
    try {
        // Validate incoming data
        const safedata = SignupSchema.safeParse(req.body);

        if (!safedata.success) {
            return res.status(400).json(zodErrorFormatter(safedata.error));
        }

        const { name, email, password, role } = safedata.data as SignupData;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists",
                user: existingUser
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role
        });

        const savedUser = await newUser.save();

        const jwtToken = jwt.sign(
            { id: savedUser._id, role: savedUser.role },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie('token', jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000

        })
        const { password: _, ...userData } = savedUser.toObject();

        return res.status(201).json({
            message: "User created successfully",
            user: userData,
            token: jwtToken
        });
    } catch (error: any) {
        console.error("Signup error:", error);
        return res.status(500).json({
            message: "Oops! Something went wrong!",
            errors: error.errors || error.message
        });
    }
}


export const login = async (req: Request, res: Response) => {
    const safedata = LoginSchema.safeParse(req.body);
    if (!safedata.success) {
        return res.status(400).json(zodErrorFormatter(safedata.error));
    }
    const { email, password } = safedata.data as LoginData;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "user not found"
            })
        }
        const ispasswordValid = await bcrypt.compare(password, user?.password);
        if (!ispasswordValid) {
            return res.status(401).json({
                message: "invalid credentials"
            })
        }
        const jwtToken = jwt.sign({
            id: user._id,
            role: user.role
        }, JWT_SECRET, { expiresIn: '7d' })

        res.cookie('token', jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000

        })
        const { password: _, ...userData } = user.toObject();
        return res.status(200).json({
            message: "user login sucessfully!",
            user
        })

    } catch (error: any) {
        return res.status(500).json({
            message: "oops! something went wrong!",
            error: error.message
        })
    }

}


