import { Router } from "express";
import {
  completeSurveySessionController,
  getCampaignAnalyticsController,
  getCampaignAnswersController,
  getCampaignSessionsController,
  startSurveySessionController,
  submitAnswerController,
} from "./response.controller";
import {
  authMiddleware,
  authorizeCompanyRoles,
  authorizeRoles,
} from "../../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);
router.use(authorizeRoles("COMPANY"));

router.post(
  "/sessions/start",
  authorizeCompanyRoles("OWNER", "MANAGER"),
  startSurveySessionController
);

router.post(
  "/answers",
  authorizeCompanyRoles("OWNER", "MANAGER"),
  submitAnswerController
);

router.post(
  "/sessions/complete",
  authorizeCompanyRoles("OWNER", "MANAGER"),
  completeSurveySessionController
);

router.get(
  "/campaigns/:campaignId/answers",
  authorizeCompanyRoles("OWNER", "MANAGER", "ANALYST"),
  getCampaignAnswersController
);

router.get(
  "/campaigns/:campaignId/sessions",
  authorizeCompanyRoles("OWNER", "MANAGER", "ANALYST"),
  getCampaignSessionsController
);

router.get(
  "/campaigns/:campaignId/analytics",
  authorizeCompanyRoles("OWNER", "MANAGER", "ANALYST"),
  getCampaignAnalyticsController
);

export default router;