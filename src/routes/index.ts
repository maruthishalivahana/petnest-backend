import express from "express";
import { authRouter } from "./auth.routes";
import { adminRouter } from "./admin.routes";
import { sellerRouter } from "./seller.routes";
import { buyerRouter } from "./buyer.routes";
import { adRouter } from "./ad.routes";


const router = express.Router();

// Mount all route modules
router.use("/auth", authRouter);
router.use("/ads", adRouter);
router.use("/admin", adminRouter);
router.use("/seller", sellerRouter);
router.use("/buyer", buyerRouter);

export default router;
