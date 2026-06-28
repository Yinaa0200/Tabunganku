import { Router } from "express";

import { requireAuth } from "../middlewares/auth.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import validate from "../middlewares/validate.js";
import {
    getDashboard,
    getMonthlySummary,
    getRecentTransactions,
    getStatistics,
} from "../controllers/dashboard.controller.js";
import { monthlySummaryQuerySchema } from "../validation/dashboard.validation.js";

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
 * /dashboard/monthly-summary:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get monthly income and expense summary
 *     description: Retrieve deposit and withdrawal totals for a specific month and optionally a specific savings goal.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: string
 *           example: 2026-05
 *       - in: query
 *         name: savings_id
 *         schema:
 *           type: string
 *           example: 11111111-1111-1111-1111-111111111111
 *     responses:
 *       200:
 *         description: Monthly summary retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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

router.get(
    "/monthly-summary",
    requireAuth,
    validate(monthlySummaryQuerySchema, "query"),
    asyncHandler(getMonthlySummary)
);

export default router;
