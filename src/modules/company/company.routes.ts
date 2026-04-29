import { Router } from "express";
import {
  getCompaniesController,
  getCompanyByIdController,
  getMyCompanyController,
  updateCompanyStatusController,
  updateMyCompanyController,
} from "./company.controller";
import {
  authMiddleware,
  authorizeRoles,
} from "../../middlewares/auth.middleware";

const router = Router();

router.get("/me", authMiddleware, authorizeRoles("COMPANY"), getMyCompanyController);

router.patch(
  "/me",
  authMiddleware,
  authorizeRoles("COMPANY"),
  updateMyCompanyController
);

router.get(
  "/",
  authMiddleware,
  authorizeRoles("ADMIN"),
  getCompaniesController
);

router.get(
  "/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  getCompanyByIdController
);

router.patch(
  "/:id/status",
  authMiddleware,
  authorizeRoles("ADMIN"),
  updateCompanyStatusController
);

export default router;