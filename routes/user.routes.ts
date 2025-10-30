import express from "express";
import { signUp } from "../controllers/auth.contoller";
export const authRouter = express.Router();

authRouter.post('/signup', signUp);
