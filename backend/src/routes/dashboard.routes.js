import { Router } from "express";

import { requireAuth } from "../middlewares/auth.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import { getDashboard, getRecentTransactions, getStatistics } from "../controllers/dashboard.controller.js";

const router = Router();

router.get(
    "/",
    requireAuth,
    asyncHandler(getDashboard)
);

router.get(
    "/statistics",
    requireAuth,
    asyncHandler(getStatistics)
);

router.get(
    "/recent-transactions",
    requireAuth,
    asyncHandler(getRecentTransactions)
);

export default router;
