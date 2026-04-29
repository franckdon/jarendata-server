import { NextFunction, Request, Response } from "express";
import {
  completeSurveySessionService,
  getCampaignAnalyticsService,
  getCampaignAnswersService,
  getCampaignSessionsService,
  startSurveySessionService,
  submitAnswerService,
} from "./response.service";
import {
  completeSurveySessionSchema,
  startSurveySessionSchema,
  submitAnswerSchema,
} from "./response.validation";

export const startSurveySessionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = startSurveySessionSchema.parse(req.body);
    const session = await startSurveySessionService(req.user.companyId, data);

    res.status(201).json({
      message: "Session de réponse démarrée avec succès",
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

export const submitAnswerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = submitAnswerSchema.parse(req.body);
    const answer = await submitAnswerService(req.user.companyId, data);

    res.status(201).json({
      message: "Réponse enregistrée avec succès",
      data: answer,
    });
  } catch (error) {
    next(error);
  }
};

export const completeSurveySessionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = completeSurveySessionSchema.parse(req.body);
    const session = await completeSurveySessionService(req.user.companyId, data);

    res.status(200).json({
      message: "Session terminée avec succès",
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

export const getCampaignAnswersController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const answers = await getCampaignAnswersService(
      req.user.companyId,
      req.params.campaignId,
      req.query
    );

    res.status(200).json({
      message: "Réponses récupérées avec succès",
      ...answers,
    });
  } catch (error) {
    next(error);
  }
};

export const getCampaignSessionsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessions = await getCampaignSessionsService(
      req.user.companyId,
      req.params.campaignId,
      req.query
    );

    res.status(200).json({
      message: "Sessions récupérées avec succès",
      ...sessions,
    });
  } catch (error) {
    next(error);
  }
};

export const getCampaignAnalyticsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const analytics = await getCampaignAnalyticsService(
      req.user.companyId,
      req.params.campaignId
    );

    res.status(200).json({
      message: "Analytics récupérées avec succès",
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};