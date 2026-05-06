import { Router } from "express";
import {
  loginController,
  meController,
  registerController,
  updateMeController,
} from "./auth.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.get("/me", authMiddleware, meController);
router.patch("/me", authMiddleware, updateMeController);

export default router;