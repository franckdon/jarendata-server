import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/appError";
import {
  ApplyTemplateInput,
  CreateSurveyQuestionInput,
  ReorderQuestionsInput,
  UpdateOptionNextQuestionInput,
  UpdateSurveyQuestionInput,
} from "./survey.validation";
import { surveyTemplates } from "./survey.templates";

const ensureCampaignBelongsToCompany = async (
  companyId: string | null | undefined,
  campaignId: string
) => {
  if (!companyId) {
    throw new AppError("Entreprise introuvable", 404);
  }

  const campaign = await prisma.campaign.findFirst({
    where: {
      id: campaignId,
      companyId,
    },
  });

  if (!campaign) {
    throw new AppError("Campagne introuvable", 404);
  }

  if (!["DRAFT", "SCHEDULED", "PAUSED"].includes(campaign.status)) {
    throw new AppError("Le questionnaire ne peut plus être modifié", 403);
  }

  return campaign;
};

export const getSurveyFlowService = async (
  companyId: string | null | undefined,
  campaignId: string
) => {
  await ensureCampaignBelongsToCompany(companyId, campaignId);

  const questions = await prisma.surveyQuestion.findMany({
    where: { campaignId },
    orderBy: { order: "asc" },
    include: {
      options: {
        orderBy: { order: "asc" },
      },
    },
  });

  return questions;
};

export const createSurveyQuestionService = async (
  companyId: string | null | undefined,
  campaignId: string,
  data: CreateSurveyQuestionInput
) => {
  await ensureCampaignBelongsToCompany(companyId, campaignId);

  const existingOrder = await prisma.surveyQuestion.findFirst({
    where: {
      campaignId,
      order: data.order,
    },
  });

  if (existingOrder) {
    throw new AppError("Une question existe déjà à cet ordre", 409);
  }

  const question = await prisma.surveyQuestion.create({
    data: {
      campaignId,
      title: data.title,
      description: data.description,
      type: data.type,
      order: data.order,
      isRequired: data.isRequired ?? true,
      placeholder: data.placeholder,
      minValue: data.minValue,
      maxValue: data.maxValue,
      options: data.options
        ? {
            create: data.options.map((option) => ({
              label: option.label,
              value: option.value,
              order: option.order,
              nextQuestionId: option.nextQuestionId || null,
            })),
          }
        : undefined,
    },
    include: {
      options: {
        orderBy: { order: "asc" },
      },
    },
  });

  return question;
};

export const updateSurveyQuestionService = async (
  companyId: string | null | undefined,
  campaignId: string,
  questionId: string,
  data: UpdateSurveyQuestionInput
) => {
  await ensureCampaignBelongsToCompany(companyId, campaignId);

  const question = await prisma.surveyQuestion.findFirst({
    where: {
      id: questionId,
      campaignId,
    },
  });

  if (!question) {
    throw new AppError("Question introuvable", 404);
  }

  if (data.order && data.order !== question.order) {
    const existingOrder = await prisma.surveyQuestion.findFirst({
      where: {
        campaignId,
        order: data.order,
        NOT: { id: questionId },
      },
    });

    if (existingOrder) {
      throw new AppError("Une question existe déjà à cet ordre", 409);
    }
  }

  const updatedQuestion = await prisma.surveyQuestion.update({
    where: { id: questionId },
    data: {
      title: data.title,
      description: data.description,
      type: data.type,
      order: data.order,
      isRequired: data.isRequired,
      placeholder: data.placeholder,
      minValue: data.minValue,
      maxValue: data.maxValue,
    },
    include: {
      options: {
        orderBy: { order: "asc" },
      },
    },
  });

  return updatedQuestion;
};

export const deleteSurveyQuestionService = async (
  companyId: string | null | undefined,
  campaignId: string,
  questionId: string
) => {
  await ensureCampaignBelongsToCompany(companyId, campaignId);

  const question = await prisma.surveyQuestion.findFirst({
    where: {
      id: questionId,
      campaignId,
    },
  });

  if (!question) {
    throw new AppError("Question introuvable", 404);
  }

  await prisma.surveyOption.updateMany({
    where: {
      nextQuestionId: questionId,
    },
    data: {
      nextQuestionId: null,
    },
  });

  await prisma.surveyQuestion.delete({
    where: { id: questionId },
  });

  return true;
};

export const replaceQuestionOptionsService = async (
  companyId: string | null | undefined,
  campaignId: string,
  questionId: string,
  options: CreateSurveyQuestionInput["options"]
) => {
  await ensureCampaignBelongsToCompany(companyId, campaignId);

  const question = await prisma.surveyQuestion.findFirst({
    where: {
      id: questionId,
      campaignId,
    },
  });

  if (!question) {
    throw new AppError("Question introuvable", 404);
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.surveyOption.deleteMany({
      where: { questionId },
    });

    if (options && options.length > 0) {
      await tx.surveyOption.createMany({
        data: options.map((option) => ({
          questionId,
          label: option.label,
          value: option.value,
          order: option.order,
          nextQuestionId: option.nextQuestionId || null,
        })),
      });
    }

    return tx.surveyQuestion.findUnique({
      where: { id: questionId },
      include: {
        options: {
          orderBy: { order: "asc" },
        },
      },
    });
  });

  return result;
};

export const updateOptionNextQuestionService = async (
  companyId: string | null | undefined,
  campaignId: string,
  optionId: string,
  data: UpdateOptionNextQuestionInput
) => {
  await ensureCampaignBelongsToCompany(companyId, campaignId);

  const option = await prisma.surveyOption.findFirst({
    where: {
      id: optionId,
      question: {
        campaignId,
      },
    },
  });

  if (!option) {
    throw new AppError("Option introuvable", 404);
  }

  if (data.nextQuestionId) {
    const nextQuestion = await prisma.surveyQuestion.findFirst({
      where: {
        id: data.nextQuestionId,
        campaignId,
      },
    });

    if (!nextQuestion) {
      throw new AppError("Question de destination introuvable", 404);
    }
  }

  const updatedOption = await prisma.surveyOption.update({
    where: { id: optionId },
    data: {
      nextQuestionId: data.nextQuestionId,
    },
  });

  return updatedOption;
};

export const reorderQuestionsService = async (
  companyId: string | null | undefined,
  campaignId: string,
  data: ReorderQuestionsInput
) => {
  await ensureCampaignBelongsToCompany(companyId, campaignId);

  await prisma.$transaction(
    data.questions.map((question) =>
      prisma.surveyQuestion.update({
        where: { id: question.id },
        data: { order: question.order },
      })
    )
  );

  return getSurveyFlowService(companyId, campaignId);
};

export const applySurveyTemplateService = async (
  companyId: string | null | undefined,
  campaignId: string,
  data: ApplyTemplateInput
) => {
  await ensureCampaignBelongsToCompany(companyId, campaignId);

  const template = surveyTemplates[data.templateKey];

  if (!template) {
    throw new AppError("Template introuvable", 404);
  }

  const existingQuestionsCount = await prisma.surveyQuestion.count({
    where: { campaignId },
  });

  if (existingQuestionsCount > 0) {
    throw new AppError(
      "Cette campagne contient déjà des questions. Supprimez-les avant d’appliquer un template",
      409
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const createdQuestions: Array<{ id: string; order: number }> = [];

    for (const questionTemplate of template) {
      const question = await tx.surveyQuestion.create({
        data: {
          campaignId,
          title: questionTemplate.title,
          type: questionTemplate.type as any,
          order: questionTemplate.order,
          placeholder: "placeholder" in questionTemplate ? questionTemplate.placeholder : undefined,
          minValue: "minValue" in questionTemplate ? questionTemplate.minValue : undefined,
          maxValue: "maxValue" in questionTemplate ? questionTemplate.maxValue : undefined,
        },
      });

      createdQuestions.push({
        id: question.id,
        order: question.order,
      });
    }

    for (const questionTemplate of template) {
      const currentQuestion = createdQuestions.find(
        (question) => question.order === questionTemplate.order
      );

      if (!currentQuestion || !("options" in questionTemplate) || !questionTemplate.options) {
        continue;
      }

      await tx.surveyOption.createMany({
        data: questionTemplate.options.map((option) => {
          const nextQuestion = "nextOrder" in option
            ? createdQuestions.find((q) => q.order === option.nextOrder)
            : undefined;

          return {
            questionId: currentQuestion.id,
            label: option.label,
            value: option.value,
            order: option.order,
            nextQuestionId: nextQuestion?.id || null,
          };
        }),
      });
    }

    return tx.surveyQuestion.findMany({
      where: { campaignId },
      orderBy: { order: "asc" },
      include: {
        options: {
          orderBy: { order: "asc" },
        },
      },
    });
  });

  return result;
};