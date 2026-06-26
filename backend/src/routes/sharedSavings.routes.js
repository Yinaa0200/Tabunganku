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
