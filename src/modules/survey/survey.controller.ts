import { NextFunction, Request, Response } from "express";
import {
  applySurveyTemplateService,
  createSurveyQuestionService,
  deleteSurveyQuestionService,
  getSurveyFlowService,
  reorderQuestionsService,
  replaceQuestionOptionsService,
  updateOptionNextQuestionService,
  updateSurveyQuestionService,
} from "./survey.service";
import {
  applyTemplateSchema,
  createSurveyQuestionSchema,
  reorderQuestionsSchema,
  updateOptionNextQuestionSchema,
  updateSurveyQuestionSchema,
} from "./survey.validation";

export const getSurveyFlowController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const questions = await getSurveyFlowService(
      req.user.companyId,
      req.params.campaignId
    );

    res.status(200).json({
      message: "Questionnaire récupéré avec succès",
      data: questions,
    });
  } catch (error) {
    next(error);
  }
};

export const createSurveyQuestionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = createSurveyQuestionSchema.parse(req.body);

    const question = await createSurveyQuestionService(
      req.user.companyId,
      req.params.campaignId,
      data
    );

    res.status(201).json({
      message: "Question créée avec succès",
      data: question,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSurveyQuestionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = updateSurveyQuestionSchema.parse(req.body);

    const question = await updateSurveyQuestionService(
      req.user.companyId,
      req.params.campaignId,
      req.params.questionId,
      data
    );

    res.status(200).json({
      message: "Question mise à jour avec succès",
      data: question,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSurveyQuestionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await deleteSurveyQuestionService(
      req.user.companyId,
      req.params.campaignId,
      req.params.questionId
    );

    res.status(200).json({
      message: "Question supprimée avec succès",
    });
  } catch (error) {
    next(error);
  }
};

export const replaceQuestionOptionsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = createSurveyQuestionSchema.pick({ options: true }).parse(req.body);

    const question = await replaceQuestionOptionsService(
      req.user.companyId,
      req.params.campaignId,
      req.params.questionId,
      data.options
    );

    res.status(200).json({
      message: "Options remplacées avec succès",
      data: question,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOptionNextQuestionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = updateOptionNextQuestionSchema.parse(req.body);

    const option = await updateOptionNextQuestionService(
      req.user.companyId,
      req.params.campaignId,
      req.params.optionId,
      data
    );

    res.status(200).json({
      message: "Redirection de l’option mise à jour avec succès",
      data: option,
    });
  } catch (error) {
    next(error);
  }
};

export const reorderQuestionsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = reorderQuestionsSchema.parse(req.body);

    const questions = await reorderQuestionsService(
      req.user.companyId,
      req.params.campaignId,
      data
    );

    res.status(200).json({
      message: "Ordre des questions mis à jour avec succès",
      data: questions,
    });
  } catch (error) {
    next(error);
  }
};

export const applySurveyTemplateController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = applyTemplateSchema.parse(req.body);

    const questions = await applySurveyTemplateService(
      req.user.companyId,
      req.params.campaignId,
      data
    );

    res.status(201).json({
      message: "Template appliqué avec succès",
      data: questions,
    });
  } catch (error) {
    next(error);
  }
};