import { Router } from "express";
import {
    getProfile,
    updateProfile,
    changePassword
} from "../controllers/profile.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, getProfile);
router.put("/", requireAuth, updateProfile);
router.put("/password", requireAuth, changePassword);

export default router;