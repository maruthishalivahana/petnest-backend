import express from "express";
// import { getAllUsersController, deleteuserByIdController } from "../AdminServices/admin.controller";
import { verifyToken, requireRole } from "../middlewares/auth.middleware";
import { getAllUsersController } from "../controllers/getUsers/getusers.admin.controller";
import { deleteuserByIdController } from "../controllers/deleteuser/deleteuser.controller";

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