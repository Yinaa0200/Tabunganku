import { Router } from "express";
import multer from "multer";

import { requireAuth } from "../middlewares/auth.js";

import asyncHandler from "../middlewares/asyncHandler.js";

import validate from "../middlewares/validate.js";

import {
    createSavings,
    getSavings,
    getSavingsById,
    updateSavings,
    uploadSavingsImage,
    deleteSavings,
    getTransactionsBySavingsId
} from "../controllers/savings.controller.js";

import { 
    createSavingsSchema, 
    updateSavingsSchema, 
    savingsParamsSchema,
    savingsQuerySchema 
} from "../validation/savings.validation.js";
import { transactionQuerySchema, transactionParamsSchema } from "../validation/transaction.validation.js";

/**
 * @swagger
 * /savings:
 *   post:
 *     tags: [Savings]
 *     summary: Create a savings goal
 *     description: Create a new personal savings goal.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSavingsRequest'
 *     responses:
 *       201:
 *         description: Savings goal created successfully.
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
 *     tags: [Savings]
 *     summary: List savings goals
 *     description: Retrieve paginated savings goals for the authenticated user.
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
 *         name: keyword
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Savings list retrieved successfully.
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
 * /savings/{id}:
 *   get:
 *     tags: [Savings]
 *     summary: Get savings goal by id
 *     description: Retrieve a single savings goal by UUID.
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
 *         description: Savings retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Savings goal not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     tags: [Savings]
 *     summary: Update savings goal
 *     description: Update an existing savings goal.
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
 *             $ref: '#/components/schemas/UpdateSavingsRequest'
 *     responses:
 *       200:
 *         description: Savings updated successfully.
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
 *   delete:
 *     tags: [Savings]
 *     summary: Delete savings goal
 *     description: Delete a savings goal by id.
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
 *         description: Savings deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Savings goal not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * /savings/{id}/transactions:
 *   get:
 *     tags: [Savings]
 *     summary: Get transactions for a savings goal
 *     description: Retrieve transactions associated with a savings goal.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 */
const router = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
            return;
        }

        cb(new Error("Format file tidak didukung. Gunakan gambar."));
    },
});

router.post(
    "/",
    requireAuth,
    validate(createSavingsSchema),
    asyncHandler(createSavings)
);

router.get(
    "/",
    requireAuth,
    validate(savingsQuerySchema, "query"),
    asyncHandler(getSavings)
);

router.get(
    "/:id",
    requireAuth,
    validate(savingsParamsSchema, "params"),
    asyncHandler(getSavingsById)
);

router.post(
    "/:id/image",
    requireAuth,
    validate(savingsParamsSchema, "params"),
    upload.single("image"),
    asyncHandler(uploadSavingsImage)
);

router.get(
    "/:id/transactions",
    requireAuth,
    validate(transactionParamsSchema, "params"),
    validate(transactionQuerySchema, "query"),
    asyncHandler(getTransactionsBySavingsId)
);

router.put(
    "/:id",
    requireAuth,
    validate(savingsParamsSchema, "params"),
    validate(updateSavingsSchema),
    asyncHandler(updateSavings)
);

router.delete(
    "/:id",
    requireAuth,
    validate(savingsParamsSchema, "params"),
    asyncHandler(deleteSavings)
);

export default router;