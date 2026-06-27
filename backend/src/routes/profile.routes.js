import { Router } from "express";
import validate from "../middlewares/validate.js";
import {
    getProfile,
    updateProfile,
    changePassword
} from "../controllers/profile.controller.js";
import {
    updateProfileSchema,
    changePasswordSchema
} from "../validation/profile.validation.js";
import { requireAuth } from "../middlewares/auth.js";
import asyncHandler from "../middlewares/asyncHandler.js";

/**
 * @swagger
 * /profile:
 *   get:
 *     tags: [Profile]
 *     summary: Get current user profile
 *     description: Retrieve the authenticated user's profile information.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully.
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
 *   put:
 *     tags: [Profile]
 *     summary: Update user profile
 *     description: Update profile details for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileRequest'
 *     responses:
 *       200:
 *         description: Profile updated successfully.
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
 * /profile/password:
 *   put:
 *     tags: [Profile]
 *     summary: Change password
 *     description: Change the authenticated user's password.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Password changed successfully.
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
    asyncHandler(getProfile)
);

router.put(
    "/", 
    requireAuth,
    validate(updateProfileSchema),
    asyncHandler(updateProfile)
);

router.put(
    "/password", 
    requireAuth,
    validate(changePasswordSchema),
    asyncHandler(changePassword)
);

export default router;