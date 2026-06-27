import { Router } from "express";

import { requireAuth } from "../middlewares/auth.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import { getDashboard, getRecentTransactions, getStatistics } from "../controllers/dashboard.controller.js";

/**
 * @swagger
 * /dashboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get dashboard overview
 *     description: Retrieve an overview of savings, transactions, and targets for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * /dashboard/statistics:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get monthly statistics
 *     description: Retrieve monthly deposit and withdrawal statistics for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * /dashboard/recent-transactions:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get recent transactions
 *     description: Retrieve the latest transactions for the dashboard summary.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Recent transactions retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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
