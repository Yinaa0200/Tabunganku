import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import validate from "../middlewares/validate.js";
import {
    transactionQuerySchema,
    transactionParamsSchema,
    updateTransactionSchema
} from "../validation/transaction.validation.js";
import {
    createTransaction,
    getTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
    getTransactionsBySavingsId
} from "../controllers/transaction.controller.js";
import {
    createTransactionSchema
} from "../validation/transaction.validation.js";

/**
 * @swagger
 * /transactions:
 *   post:
 *     tags: [Transactions]
 *     summary: Create a transaction
 *     description: Create a new transaction for a savings goal.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTransactionRequest'
 *     responses:
 *       201:
 *         description: Transaction created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation or balance error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   get:
 *     tags: [Transactions]
 *     summary: List transactions
 *     description: Retrieve transactions for the authenticated user.
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
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: savings_id
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully.
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
 * /transactions/{id}:
 *   get:
 *     tags: [Transactions]
 *     summary: Get transaction by id
 *     description: Retrieve a single transaction by UUID.
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
 *         description: Transaction retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Transaction not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   patch:
 *     tags: [Transactions]
 *     summary: Update transaction
 *     description: Update an existing transaction.
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
 *             $ref: '#/components/schemas/UpdateTransactionRequest'
 *     responses:
 *       200:
 *         description: Transaction updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation or balance error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     tags: [Transactions]
 *     summary: Delete transaction
 *     description: Delete a transaction by id.
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
 *         description: Transaction deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Transaction not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
const router = Router();

router.get(
    "/",
    requireAuth,
    validate(transactionQuerySchema, "query"),
    asyncHandler(getTransactions)
);

router.get(
    "/:id",
    requireAuth,
    validate(transactionParamsSchema, "params"),
    asyncHandler(getTransactionById)
);

router.patch(
    "/:id",
    requireAuth,
    validate(transactionParamsSchema, "params"),
    validate(updateTransactionSchema),
    asyncHandler(updateTransaction)
);

router.delete(
    "/:id",
    requireAuth,
    validate(transactionParamsSchema, "params"),
    asyncHandler(deleteTransaction)
);

router.post(
    "/",
    requireAuth,
    validate(createTransactionSchema),
    asyncHandler(createTransaction)
);

export default router;