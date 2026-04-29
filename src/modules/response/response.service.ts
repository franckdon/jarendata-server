import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/appError";
import { paginate } from "../../utils/pagination";
import {
  CompleteSurveySessionInput,
  ResponseQuery,
  StartSurveySessionInput,
  SubmitAnswerInput,
} from "./response.validation";
import {
  getCampaignOverviewAnalytics,
  getNpsAnalytics,
  getQuestionAnalytics,
} from "./response.analytics";

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

  return campaign;
};

export const startSurveySessionService = async (
  companyId: string | null | undefined,
  data: StartSurveySessionInput
) => {
  await ensureCampaignBelongsToCompany(companyId, data.campaignId);

  const contact = await prisma.contact.findFirst({
    where: {
      id: data.contactId,
      companyId: companyId || "",
    },
  });

  if (!contact) {
    throw new AppError("Contact introuvable", 404);
  }

  if (contact.consentStatus !== "ACCEPTED") {
    throw new AppError("Ce contact n’a pas donné son consentement", 403);
  }

  const session = await prisma.surveySession.upsert({
    where: {
      campaignId_contactId: {
        campaignId: data.campaignId,
        contactId: data.contactId,
      },
    },
    update: {
      status: "IN_PROGRESS",
    },
    create: {
      campaignId: data.campaignId,
      contactId: data.contactId,
      recipientId: data.recipientId,
      status: "STARTED",
    },
    include: {
      contact: true,
      campaign: true,
    },
  });

  return session;
};

export const submitAnswerService = async (
  companyId: string | null | undefined,
  data: SubmitAnswerInput
) => {
  await ensureCampaignBelongsToCompany(companyId, data.campaignId);

  const session = await prisma.surveySession.findUnique({
    where: {
      campaignId_contactId: {
        campaignId: data.campaignId,
        contactId: data.contactId,
      },
    },
  });

  if (!session) {
    throw new AppError("Session de réponse introuvable", 404);
  }

  const question = await prisma.surveyQuestion.findFirst({
    where: {
      id: data.questionId,
      campaignId: data.campaignId,
    },
    include: {
      options: true,
    },
  });

  if (!question) {
    throw new AppError("Question introuvable", 404);
  }

  if (data.optionId) {
    const optionExists = question.options.some(
      (option) => option.id === data.optionId
    );

    if (!optionExists) {
      throw new AppError("Option invalide pour cette question", 400);
    }
  }

  const answer = await prisma.surveyAnswer.upsert({
    where: {
      sessionId_questionId: {
        sessionId: session.id,
        questionId: data.questionId,
      },
    },
    update: {
      optionId: data.optionId || null,
      answerType: data.answerType,
      textValue: data.textValue,
      numberValue: data.numberValue,
      booleanValue: data.booleanValue,
      values: data.values || [],
      rawValue: data.rawValue,
    },
    create: {
      sessionId: session.id,
      campaignId: data.campaignId,
      contactId: data.contactId,
      questionId: data.questionId,
      optionId: data.optionId || null,
      answerType: data.answerType,
      textValue: data.textValue,
      numberValue: data.numberValue,
      booleanValue: data.booleanValue,
      values: data.values || [],
      rawValue: data.rawValue,
    },
    include: {
      question: true,
      option: true,
    },
  });

  await prisma.surveySession.update({
    where: { id: session.id },
    data: {
      status: "IN_PROGRESS",
    },
  });

  return answer;
};

export const completeSurveySessionService = async (
  companyId: string | null | undefined,
  data: CompleteSurveySessionInput
) => {
  await ensureCampaignBelongsToCompany(companyId, data.campaignId);

  const session = await prisma.surveySession.findUnique({
    where: {
      campaignId_contactId: {
        campaignId: data.campaignId,
        contactId: data.contactId,
      },
    },
  });

  if (!session) {
    throw new AppError("Session de réponse introuvable", 404);
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedSession = await tx.surveySession.update({
      where: { id: session.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    if (session.recipientId) {
      await tx.campaignRecipient.update({
        where: { id: session.recipientId },
        data: {
          status: "RESPONDED",
          respondedAt: new Date(),
        },
      });
    } else {
      await tx.campaignRecipient.updateMany({
        where: {
          campaignId: data.campaignId,
          contactId: data.contactId,
        },
        data: {
          status: "RESPONDED",
          respondedAt: new Date(),
        },
      });
    }

    return updatedSession;
  });

  return result;
};

export const getCampaignAnswersService = async (
  companyId: string | null | undefined,
  campaignId: string,
  query: ResponseQuery
) => {
  await ensureCampaignBelongsToCompany(companyId, campaignId);

  const search = query.search?.trim();

  const where: any = {
    campaignId,
    ...(query.questionId ? { questionId: query.questionId } : {}),
    ...(query.contactId ? { contactId: query.contactId } : {}),
    ...(search
      ? {
          OR: [
            { textValue: { contains: search, mode: "insensitive" } },
            { rawValue: { contains: search, mode: "insensitive" } },
            {
              contact: {
                fullName: { contains: search, mode: "insensitive" },
              },
            },
            {
              contact: {
                phone: { contains: search, mode: "insensitive" },
              },
            },
          ],
        }
      : {}),
  };

  return paginate({
    model: prisma.surveyAnswer,
    page: query.page,
    limit: query.limit,
    where,
    orderBy: { createdAt: "desc" },
    include: {
      contact: true,
      question: true,
      option: true,
    },
  });
};

export const getCampaignSessionsService = async (
  companyId: string | null | undefined,
  campaignId: string,
  query: ResponseQuery
) => {
  await ensureCampaignBelongsToCompany(companyId, campaignId);

  return paginate({
    model: prisma.surveySession,
    page: query.page,
    limit: query.limit,
    where: {
      campaignId,
      ...(query.contactId ? { contactId: query.contactId } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      contact: true,
      answers: {
        include: {
          question: true,
          option: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
};

export const getCampaignAnalyticsService = async (
  companyId: string | null | undefined,
  campaignId: string
) => {
  const campaign = await ensureCampaignBelongsToCompany(companyId, campaignId);

  const [overview, questions, nps] = await Promise.all([
    getCampaignOverviewAnalytics(campaignId),
    getQuestionAnalytics(campaignId),
    getNpsAnalytics(campaignId),
  ]);

  return {
    campaign: {
      id: campaign.id,
      name: campaign.name,
      type: campaign.type,
      status: campaign.status,
    },
    overview,
    questions,
    nps,
  };
};