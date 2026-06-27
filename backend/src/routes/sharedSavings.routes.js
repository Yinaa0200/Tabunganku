import { Router } from "express";

import { requireAuth } from "../middlewares/auth.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import validate from "../middlewares/validate.js";
import {
    createSharedSavings,
    createSharedTransaction,
    deleteSharedSavings,
    deleteSharedTransaction,
    getSharedSavings,
    getSharedSavingsById,
    getSharedSavingsMembers,
    getSharedSavingsStatistics,
    joinSharedSavings,
    updateSharedSavings,
    updateSharedTransaction
} from "../controllers/sharedSavings.controller.js";
import {
    createSharedSavingsSchema,
    createSharedTransactionSchema,
    joinSharedSavingsSchema,
    sharedSavingsParamsSchema,
    sharedSavingsQuerySchema,
    sharedTransactionParamsSchema,
    updateSharedSavingsSchema,
    updateSharedTransactionSchema
} from "../validation/sharedSavings.validation.js";

/**
 * @swagger
 * /shared-savings:
 *   post:
 *     tags: [Shared Savings]
 *     summary: Create a shared savings group
 *     description: Create a new shared savings group.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSharedSavingsRequest'
 *     responses:
 *       201:
 *         description: Shared savings created successfully.
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
 *   get:
 *     tags: [Shared Savings]
 *     summary: List shared savings groups
 *     description: Retrieve shared savings groups for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Shared savings list retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 * /shared-savings/{id}:
 *   get:
 *     tags: [Shared Savings]
 *     summary: Get shared savings by id
 *     description: Retrieve a single shared savings group by UUID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Shared savings retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Shared savings not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   patch:
 *     tags: [Shared Savings]
 *     summary: Update shared savings group
 *     description: Update a shared savings group by id.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSharedSavingsRequest'
 *     responses:
 *       200:
 *         description: Shared savings updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *   delete:
 *     tags: [Shared Savings]
 *     summary: Delete shared savings group
 *     description: Delete a shared savings group by id.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Shared savings deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 * /shared-savings/join:
 *   post:
 *     tags: [Shared Savings]
 *     summary: Join a shared savings group
 *     description: Join an existing shared savings group using an invite code.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JoinSharedSavingsRequest'
 *     responses:
 *       200:
 *         description: Joined shared savings successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 * /shared-savings/{id}/members:
 *   get:
 *     tags: [Shared Savings]
 *     summary: Get shared savings members
 *     description: Retrieve members of a shared savings group.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Shared savings members retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 * /shared-savings/{id}/statistics:
 *   get:
 *     tags: [Shared Savings]
 *     summary: Get shared savings statistics
 *     description: Retrieve member contribution statistics for a shared savings group.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Shared savings statistics retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
/**
 * @swagger
 * /shared-transactions:
 *   post:
 *     tags: [Shared Transactions]
 *     summary: Create a shared transaction
 *     description: Create a new transaction for a shared savings group
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSharedTransactionRequest'
 *     responses:
 *       201:
 *         description: Shared transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * /shared-transactions/{id}:
 *   patch:
 *     tags: [Shared Transactions]
 *     summary: Update shared transaction
 *     description: Update an existing shared transaction
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSharedTransactionRequest'
 *     responses:
 *       200:
 *         description: Shared transaction updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Shared transaction not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     tags: [Shared Transactions]
 *     summary: Delete shared transaction
 *     description: Delete a shared transaction by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Shared transaction deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Shared transaction not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
const sharedSavingsRouter = Router();
const sharedTransactionRouter = Router();

sharedSavingsRouter.post(
    "/",
    requireAuth,
    validate(createSharedSavingsSchema),
    asyncHandler(createSharedSavings)
);

sharedSavingsRouter.get(
    "/",
    requireAuth,
    validate(sharedSavingsQuerySchema, "query"),
    asyncHandler(getSharedSavings)
);

sharedSavingsRouter.get(
    "/:id",
    requireAuth,
    validate(sharedSavingsParamsSchema, "params"),
    asyncHandler(getSharedSavingsById)
);

sharedSavingsRouter.patch(
    "/:id",
    requireAuth,
    validate(sharedSavingsParamsSchema, "params"),
    validate(updateSharedSavingsSchema),
    asyncHandler(updateSharedSavings)
);

sharedSavingsRouter.delete(
    "/:id",
    requireAuth,
    validate(sharedSavingsParamsSchema, "params"),
    asyncHandler(deleteSharedSavings)
);

sharedSavingsRouter.post(
    "/join",
    requireAuth,
    validate(joinSharedSavingsSchema),
    asyncHandler(joinSharedSavings)
);

sharedSavingsRouter.get(
    "/:id/members",
    requireAuth,
    validate(sharedSavingsParamsSchema, "params"),
    asyncHandler(getSharedSavingsMembers)
);

sharedSavingsRouter.get(
    "/:id/statistics",
    requireAuth,
    validate(sharedSavingsParamsSchema, "params"),
    asyncHandler(getSharedSavingsStatistics)
);

sharedTransactionRouter.post(
    "/",
    requireAuth,
    validate(createSharedTransactionSchema),
    asyncHandler(createSharedTransaction)
);

sharedTransactionRouter.patch(
    "/:id",
    requireAuth,
    validate(sharedTransactionParamsSchema, "params"),
    validate(updateSharedTransactionSchema),
    asyncHandler(updateSharedTransaction)
);

sharedTransactionRouter.delete(
    "/:id",
    requireAuth,
    validate(sharedTransactionParamsSchema, "params"),
    asyncHandler(deleteSharedTransaction)
);

export { sharedSavingsRouter, sharedTransactionRouter };
export default sharedSavingsRouter;
