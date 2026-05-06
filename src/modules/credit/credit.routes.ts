import { Router } from "express";
import {
  addCreditsController,
  adjustCreditsController,
  adminGetAllCreditTransactionsController,
  adminGetCompanyCreditTransactionsController,
  getMyCreditBalanceController,
  getMyCreditTransactionsController,
} from "./credit.controller";
import {
  authMiddleware,
  authorizeCompanyRoles,
  authorizeRoles,
} from "../../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get(
  "/me/balance",
  authorizeRoles("COMPANY"),
  authorizeCompanyRoles("OWNER", "MANAGER", "ANALYST"),
  getMyCreditBalanceController
);

router.get(
  "/me/transactions",
  authorizeRoles("COMPANY"),
  authorizeCompanyRoles("OWNER", "MANAGER", "ANALYST"),
  getMyCreditTransactionsController
);

router.get(
  "/admin/transactions",
  authorizeRoles("ADMIN"),
  adminGetAllCreditTransactionsController
);

router.get(
  "/admin/companies/:companyId/transactions",
  authorizeRoles("ADMIN"),
  adminGetCompanyCreditTransactionsController
);

router.post(
  "/admin/add",
  authorizeRoles("ADMIN"),
  addCreditsController
);

router.post(
  "/admin/adjust",
  authorizeRoles("ADMIN"),
  adjustCreditsController
);

export default router;