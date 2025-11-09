import { requestAdvisementController } from "@modules/aduser";
import express from 'express';

export const aduserRouter = express.Router();
aduserRouter.post(
    "/request/advertisement",
    requestAdvisementController
);