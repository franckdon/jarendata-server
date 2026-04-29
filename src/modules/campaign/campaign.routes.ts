import { Router } from "express";
import {
  createCampaignController,
  deleteCampaignController,
  getCampaignByIdController,
  getCampaignsController,
  updateCampaignController,
  updateCampaignStatusController,
} from "./campaign.controller";
import {
  authMiddleware,
  authorizeCompanyRoles,
  authorizeRoles,
} from "../../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);
router.use(authorizeRoles("COMPANY"));

router.get(
  "/",
  authorizeCompanyRoles("OWNER", "MANAGER", "ANALYST", "MEMBER"),
  getCampaignsController
);

router.post(
  "/",
  authorizeCompanyRoles("OWNER", "MANAGER"),
  createCampaignController
);

router.get(
  "/:id",
  authorizeCompanyRoles("OWNER", "MANAGER", "ANALYST", "MEMBER"),
  getCampaignByIdController
);

router.patch(
  "/:id",
  authorizeCompanyRoles("OWNER", "MANAGER"),
  updateCampaignController
);

router.patch(
  "/:id/status",
  authorizeCompanyRoles("OWNER", "MANAGER"),
  updateCampaignStatusController
);

router.delete(
  "/:id",
  authorizeCompanyRoles("OWNER"),
  deleteCampaignController
);

export default router;