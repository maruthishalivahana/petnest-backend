import express from "express";
import { getAllUsersController, deleteuserByIdController } from "../controllers/AdminServices/admin.controller";
import { verifyToken, requireRole } from "../middlewares/auth.middleware";
export const adminRouter = express.Router();

adminRouter.get(
    '/users',
    verifyToken,
    requireRole(['admin']),
    getAllUsersController
);
adminRouter.delete(
    '/user/:userId',
    verifyToken,
    requireRole(['admin']),
    deleteuserByIdController
);