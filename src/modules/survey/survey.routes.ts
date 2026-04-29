import { Router } from "express";
import {
  applySurveyTemplateController,
  createSurveyQuestionController,
  deleteSurveyQuestionController,
  getSurveyFlowController,
  reorderQuestionsController,
  replaceQuestionOptionsController,
  updateOptionNextQuestionController,
  updateSurveyQuestionController,
} from "./survey.controller";
import {
  authMiddleware,
  authorizeCompanyRoles,
  authorizeRoles,
} from "../../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);
router.use(authorizeRoles("COMPANY"));

router.get(
  "/campaigns/:campaignId/questions",
  authorizeCompanyRoles("OWNER", "MANAGER", "ANALYST", "MEMBER"),
  getSurveyFlowController
);

router.post(
  "/campaigns/:campaignId/questions",
  authorizeCompanyRoles("OWNER", "MANAGER"),
  createSurveyQuestionController
);

router.patch(
  "/campaigns/:campaignId/questions/reorder",
  authorizeCompanyRoles("OWNER", "MANAGER"),
  reorderQuestionsController
);

router.post(
  "/campaigns/:campaignId/templates",
  authorizeCompanyRoles("OWNER", "MANAGER"),
  applySurveyTemplateController
);

router.patch(
  "/campaigns/:campaignId/questions/:questionId",
  authorizeCompanyRoles("OWNER", "MANAGER"),
  updateSurveyQuestionController
);

router.delete(
  "/campaigns/:campaignId/questions/:questionId",
  authorizeCompanyRoles("OWNER", "MANAGER"),
  deleteSurveyQuestionController
);

router.put(
  "/campaigns/:campaignId/questions/:questionId/options",
  authorizeCompanyRoles("OWNER", "MANAGER"),
  replaceQuestionOptionsController
);

router.patch(
  "/campaigns/:campaignId/options/:optionId/next-question",
  authorizeCompanyRoles("OWNER", "MANAGER"),
  updateOptionNextQuestionController
);

export default router;