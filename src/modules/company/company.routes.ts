import { Router } from "express";
import {
  createCompanyController,
  deleteCompanyController,
  getCompaniesController,
  getCompanyByIdController,
  getMyCompanyController,
  updateCompanyController,
  updateCompanyStatusController,
  updateMyCompanyController,
} from "./company.controller";
import {
  authMiddleware,
  authorizeRoles,
} from "../../middlewares/auth.middleware";
import { uploadCompanyLogo } from "../../middlewares/upload.middleware";

const router = Router();

router.get(
  "/me",
  authMiddleware,
  authorizeRoles("COMPANY"),
  getMyCompanyController
);

router.patch(
  "/me",
  authMiddleware,
  authorizeRoles("COMPANY"),
  uploadCompanyLogo.single("logo"),
  updateMyCompanyController
);

router.post(
  "/",
  authMiddleware,
  authorizeRoles("ADMIN"),
  uploadCompanyLogo.single("logo"),
  createCompanyController
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
  "/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  uploadCompanyLogo.single("logo"),
  updateCompanyController
);

router.patch(
  "/:id/status",
  authMiddleware,
  authorizeRoles("ADMIN"),
  updateCompanyStatusController
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  deleteCompanyController
);

export default router;