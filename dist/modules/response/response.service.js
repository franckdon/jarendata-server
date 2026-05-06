"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCampaignAnalyticsService = exports.getCampaignSessionsService = exports.getCampaignAnswersService = exports.completeSurveySessionService = exports.submitAnswerService = exports.startSurveySessionService = void 0;
const prisma_1 = require("../../config/prisma");
const appError_1 = require("../../utils/appError");
const pagination_1 = require("../../utils/pagination");
const response_analytics_1 = require("./response.analytics");
const ensureCampaignBelongsToCompany = async (companyId, campaignId) => {
    if (!companyId) {
        throw new appError_1.AppError("Entreprise introuvable", 404);
    }
    const campaign = await prisma_1.prisma.campaign.findFirst({
        where: {
            id: campaignId,
            companyId,
        },
    });
    if (!campaign) {
        throw new appError_1.AppError("Campagne introuvable", 404);
    }
    return campaign;
};
const startSurveySessionService = async (companyId, data) => {
    await ensureCampaignBelongsToCompany(companyId, data.campaignId);
    const contact = await prisma_1.prisma.contact.findFirst({
        where: {
            id: data.contactId,
            companyId: companyId || "",
        },
    });
    if (!contact) {
        throw new appError_1.AppError("Contact introuvable", 404);
    }
    if (contact.consentStatus !== "ACCEPTED") {
        throw new appError_1.AppError("Ce contact n’a pas donné son consentement", 403);
    }
    const session = await prisma_1.prisma.surveySession.upsert({
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
exports.startSurveySessionService = startSurveySessionService;
const submitAnswerService = async (companyId, data) => {
    await ensureCampaignBelongsToCompany(companyId, data.campaignId);
    const session = await prisma_1.prisma.surveySession.findUnique({
        where: {
            campaignId_contactId: {
                campaignId: data.campaignId,
                contactId: data.contactId,
            },
        },
    });
    if (!session) {
        throw new appError_1.AppError("Session de réponse introuvable", 404);
    }
    const question = await prisma_1.prisma.surveyQuestion.findFirst({
        where: {
            id: data.questionId,
            campaignId: data.campaignId,
        },
        include: {
            options: true,
        },
    });
    if (!question) {
        throw new appError_1.AppError("Question introuvable", 404);
    }
    if (data.optionId) {
        const optionExists = question.options.some((option) => option.id === data.optionId);
        if (!optionExists) {
            throw new appError_1.AppError("Option invalide pour cette question", 400);
        }
    }
    const answer = await prisma_1.prisma.surveyAnswer.upsert({
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
    await prisma_1.prisma.surveySession.update({
        where: { id: session.id },
        data: {
            status: "IN_PROGRESS",
        },
    });
    return answer;
};
exports.submitAnswerService = submitAnswerService;
const completeSurveySessionService = async (companyId, data) => {
    await ensureCampaignBelongsToCompany(companyId, data.campaignId);
    const session = await prisma_1.prisma.surveySession.findUnique({
        where: {
            campaignId_contactId: {
                campaignId: data.campaignId,
                contactId: data.contactId,
            },
        },
    });
    if (!session) {
        throw new appError_1.AppError("Session de réponse introuvable", 404);
    }
    const result = await prisma_1.prisma.$transaction(async (tx) => {
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
        }
        else {
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
exports.completeSurveySessionService = completeSurveySessionService;
const getCampaignAnswersService = async (companyId, campaignId, query) => {
    await ensureCampaignBelongsToCompany(companyId, campaignId);
    const search = query.search?.trim();
    const where = {
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
    return (0, pagination_1.paginate)({
        model: prisma_1.prisma.surveyAnswer,
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
exports.getCampaignAnswersService = getCampaignAnswersService;
const getCampaignSessionsService = async (companyId, campaignId, query) => {
    await ensureCampaignBelongsToCompany(companyId, campaignId);
    return (0, pagination_1.paginate)({
        model: prisma_1.prisma.surveySession,
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
exports.getCampaignSessionsService = getCampaignSessionsService;
const getCampaignAnalyticsService = async (companyId, campaignId) => {
    const campaign = await ensureCampaignBelongsToCompany(companyId, campaignId);
    const [overview, questions, nps] = await Promise.all([
        (0, response_analytics_1.getCampaignOverviewAnalytics)(campaignId),
        (0, response_analytics_1.getQuestionAnalytics)(campaignId),
        (0, response_analytics_1.getNpsAnalytics)(campaignId),
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
exports.getCampaignAnalyticsService = getCampaignAnalyticsService;
