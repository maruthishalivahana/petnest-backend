import { requestAdvisementController } from '../modules/aduser/';
import { getPublicAdsController, getPublicAdByIdController } from "../modules/user";
import express from 'express';

export const aduserRouter = express.Router();

aduserRouter.post(
    "/request/advertisement",
    requestAdvisementController
);

// Public: list active ads (frontend)
aduserRouter.get(
    '/',
    getPublicAdsController
);

// Public: get ad details
aduserRouter.get(
    '/:adId',
    getPublicAdByIdController
);