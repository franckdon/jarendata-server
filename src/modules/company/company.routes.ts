import { Router } from "express";
import {
  createCompanyController,
  createCompanyMemberController,
  deleteCompanyController,
  deleteCompanyMemberController,
  getCompaniesController,
  getCompanyByIdController,
  getMyCompanyController,
  updateCompanyController,
  updateCompanyMemberRoleController,
  updateCompanyMemberStatusController,
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

router.post(
  "/:id/members",
  authMiddleware,
  authorizeRoles("ADMIN"),
  createCompanyMemberController
);

router.patch(
  "/:id/members/:userId/role",
  authMiddleware,
  authorizeRoles("ADMIN"),
  updateCompanyMemberRoleController
);

router.patch(
  "/:id/members/:userId/status",
  authMiddleware,
  authorizeRoles("ADMIN"),
  updateCompanyMemberStatusController
);

router.delete(
  "/:id/members/:userId",
  authMiddleware,
  authorizeRoles("ADMIN"),
  deleteCompanyMemberController
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