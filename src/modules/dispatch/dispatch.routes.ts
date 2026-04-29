import { Router } from "express";
import {
  clearCampaignRecipientsController,
  generateCampaignRecipientsController,
  getCampaignRecipientStatsController,
  getCampaignRecipientsController,
  previewCampaignRecipientsController,
  updateCampaignRecipientStatusController,
} from "./dispatch.controller";
import {
  authMiddleware,
  authorizeCompanyRoles,
  authorizeRoles,
} from "../../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);
router.use(authorizeRoles("COMPANY"));

router.get(
  "/campaigns/:campaignId/recipients/preview",
  authorizeCompanyRoles("OWNER", "MANAGER", "ANALYST"),
  previewCampaignRecipientsController
);

router.post(
  "/campaigns/:campaignId/recipients/generate",
  authorizeCompanyRoles("OWNER", "MANAGER"),
  generateCampaignRecipientsController
);

router.get(
  "/campaigns/:campaignId/recipients",
  authorizeCompanyRoles("OWNER", "MANAGER", "ANALYST"),
  getCampaignRecipientsController
);

router.get(
  "/campaigns/:campaignId/recipients/stats",
  authorizeCompanyRoles("OWNER", "MANAGER", "ANALYST"),
  getCampaignRecipientStatsController
);

router.patch(
  "/campaigns/:campaignId/recipients/:recipientId/status",
  authorizeCompanyRoles("OWNER", "MANAGER"),
  updateCampaignRecipientStatusController
);

router.delete(
  "/campaigns/:campaignId/recipients/clear",
  authorizeCompanyRoles("OWNER", "MANAGER"),
  clearCampaignRecipientsController
);

export default router;