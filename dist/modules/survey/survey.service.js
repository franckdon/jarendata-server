"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applySurveyTemplateService = exports.reorderQuestionsService = exports.updateOptionNextQuestionService = exports.replaceQuestionOptionsService = exports.deleteSurveyQuestionService = exports.updateSurveyQuestionService = exports.createSurveyQuestionService = exports.getSurveyFlowService = void 0;
const prisma_1 = require("../../config/prisma");
const appError_1 = require("../../utils/appError");
const survey_templates_1 = require("./survey.templates");
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
    if (!["DRAFT", "SCHEDULED", "PAUSED"].includes(campaign.status)) {
        throw new appError_1.AppError("Le questionnaire ne peut plus être modifié", 403);
    }
    return campaign;
};
const getSurveyFlowService = async (companyId, campaignId) => {
    await ensureCampaignBelongsToCompany(companyId, campaignId);
    const questions = await prisma_1.prisma.surveyQuestion.findMany({
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
exports.getSurveyFlowService = getSurveyFlowService;
const createSurveyQuestionService = async (companyId, campaignId, data) => {
    await ensureCampaignBelongsToCompany(companyId, campaignId);
    const existingOrder = await prisma_1.prisma.surveyQuestion.findFirst({
        where: {
            campaignId,
            order: data.order,
        },
    });
    if (existingOrder) {
        throw new appError_1.AppError("Une question existe déjà à cet ordre", 409);
    }
    const question = await prisma_1.prisma.surveyQuestion.create({
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
exports.createSurveyQuestionService = createSurveyQuestionService;
const updateSurveyQuestionService = async (companyId, campaignId, questionId, data) => {
    await ensureCampaignBelongsToCompany(companyId, campaignId);
    const question = await prisma_1.prisma.surveyQuestion.findFirst({
        where: {
            id: questionId,
            campaignId,
        },
    });
    if (!question) {
        throw new appError_1.AppError("Question introuvable", 404);
    }
    if (data.order && data.order !== question.order) {
        const existingOrder = await prisma_1.prisma.surveyQuestion.findFirst({
            where: {
                campaignId,
                order: data.order,
                NOT: { id: questionId },
            },
        });
        if (existingOrder) {
            throw new appError_1.AppError("Une question existe déjà à cet ordre", 409);
        }
    }
    const updatedQuestion = await prisma_1.prisma.surveyQuestion.update({
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
exports.updateSurveyQuestionService = updateSurveyQuestionService;
const deleteSurveyQuestionService = async (companyId, campaignId, questionId) => {
    await ensureCampaignBelongsToCompany(companyId, campaignId);
    const question = await prisma_1.prisma.surveyQuestion.findFirst({
        where: {
            id: questionId,
            campaignId,
        },
    });
    if (!question) {
        throw new appError_1.AppError("Question introuvable", 404);
    }
    await prisma_1.prisma.surveyOption.updateMany({
        where: {
            nextQuestionId: questionId,
        },
        data: {
            nextQuestionId: null,
        },
    });
    await prisma_1.prisma.surveyQuestion.delete({
        where: { id: questionId },
    });
    return true;
};
exports.deleteSurveyQuestionService = deleteSurveyQuestionService;
const replaceQuestionOptionsService = async (companyId, campaignId, questionId, options) => {
    await ensureCampaignBelongsToCompany(companyId, campaignId);
    const question = await prisma_1.prisma.surveyQuestion.findFirst({
        where: {
            id: questionId,
            campaignId,
        },
    });
    if (!question) {
        throw new appError_1.AppError("Question introuvable", 404);
    }
    const result = await prisma_1.prisma.$transaction(async (tx) => {
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
exports.replaceQuestionOptionsService = replaceQuestionOptionsService;
const updateOptionNextQuestionService = async (companyId, campaignId, optionId, data) => {
    await ensureCampaignBelongsToCompany(companyId, campaignId);
    const option = await prisma_1.prisma.surveyOption.findFirst({
        where: {
            id: optionId,
            question: {
                campaignId,
            },
        },
    });
    if (!option) {
        throw new appError_1.AppError("Option introuvable", 404);
    }
    if (data.nextQuestionId) {
        const nextQuestion = await prisma_1.prisma.surveyQuestion.findFirst({
            where: {
                id: data.nextQuestionId,
                campaignId,
            },
        });
        if (!nextQuestion) {
            throw new appError_1.AppError("Question de destination introuvable", 404);
        }
    }
    const updatedOption = await prisma_1.prisma.surveyOption.update({
        where: { id: optionId },
        data: {
            nextQuestionId: data.nextQuestionId,
        },
    });
    return updatedOption;
};
exports.updateOptionNextQuestionService = updateOptionNextQuestionService;
const reorderQuestionsService = async (companyId, campaignId, data) => {
    await ensureCampaignBelongsToCompany(companyId, campaignId);
    await prisma_1.prisma.$transaction(data.questions.map((question) => prisma_1.prisma.surveyQuestion.update({
        where: { id: question.id },
        data: { order: question.order },
    })));
    return (0, exports.getSurveyFlowService)(companyId, campaignId);
};
exports.reorderQuestionsService = reorderQuestionsService;
const applySurveyTemplateService = async (companyId, campaignId, data) => {
    await ensureCampaignBelongsToCompany(companyId, campaignId);
    const template = survey_templates_1.surveyTemplates[data.templateKey];
    if (!template) {
        throw new appError_1.AppError("Template introuvable", 404);
    }
    const existingQuestionsCount = await prisma_1.prisma.surveyQuestion.count({
        where: { campaignId },
    });
    if (existingQuestionsCount > 0) {
        throw new appError_1.AppError("Cette campagne contient déjà des questions. Supprimez-les avant d’appliquer un template", 409);
    }
    const result = await prisma_1.prisma.$transaction(async (tx) => {
        const createdQuestions = [];
        for (const questionTemplate of template) {
            const question = await tx.surveyQuestion.create({
                data: {
                    campaignId,
                    title: questionTemplate.title,
                    type: questionTemplate.type,
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
            const currentQuestion = createdQuestions.find((question) => question.order === questionTemplate.order);
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
exports.applySurveyTemplateService = applySurveyTemplateService;
