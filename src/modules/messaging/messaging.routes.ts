import { Router } from "express";
import {
  getMessageLogsController,
  getMyMessagingAccountController,
  getPlatformMessagingAccountController,
  receiveWhatsAppWebhookController,
  sendCampaignMessagesController,
  upsertMyMessagingAccountController,
  upsertPlatformMessagingAccountController,
  verifyWhatsAppWebhookController,
} from "./messaging.controller";
import {
  authMiddleware,
  authorizeCompanyRoles,
  authorizeRoles,
} from "../../middlewares/auth.middleware";

const router = Router();

router.get("/webhook", verifyWhatsAppWebhookController);
router.post("/webhook", receiveWhatsAppWebhookController);

router.get(
  "/settings/me",
  authMiddleware,
  authorizeRoles("COMPANY"),
  authorizeCompanyRoles("OWNER", "MANAGER"),
  getMyMessagingAccountController
);

router.put(
  "/settings/me",
  authMiddleware,
  authorizeRoles("COMPANY"),
  authorizeCompanyRoles("OWNER"),
  upsertMyMessagingAccountController
);

router.get(
  "/platform/settings",
  authMiddleware,
  authorizeRoles("ADMIN"),
  getPlatformMessagingAccountController
);

router.put(
  "/platform/settings",
  authMiddleware,
  authorizeRoles("ADMIN"),
  upsertPlatformMessagingAccountController
);

router.get(
  "/logs",
  authMiddleware,
  authorizeRoles("COMPANY"),
  authorizeCompanyRoles("OWNER", "MANAGER", "ANALYST"),
  getMessageLogsController
);

router.post(
  "/campaigns/:campaignId/send",
  authMiddleware,
  authorizeRoles("COMPANY"),
  authorizeCompanyRoles("OWNER", "MANAGER"),
  sendCampaignMessagesController
);

export default router;