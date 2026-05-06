"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendCampaignMessagesService = exports.getMessageLogsService = exports.upsertPlatformMessagingAccountService = exports.getPlatformMessagingAccountService = exports.upsertMyMessagingAccountService = exports.getMyMessagingAccountService = void 0;
const prisma_1 = require("../../config/prisma");
const appError_1 = require("../../utils/appError");
const pagination_1 = require("../../utils/pagination");
const conversation_engine_1 = require("./conversation.engine");
const getMyMessagingAccountService = async (companyId) => {
    if (!companyId) {
        throw new appError_1.AppError("Entreprise introuvable", 404);
    }
    const account = await prisma_1.prisma.messagingAccount.findFirst({
        where: {
            companyId,
            scope: "COMPANY",
        },
        orderBy: {
            updatedAt: "desc",
        },
    });
    return account;
};
exports.getMyMessagingAccountService = getMyMessagingAccountService;
const upsertMyMessagingAccountService = async (companyId, data) => {
    if (!companyId) {
        throw new appError_1.AppError("Entreprise introuvable", 404);
    }
    const existingAccount = await prisma_1.prisma.messagingAccount.findFirst({
        where: {
            companyId,
            scope: "COMPANY",
        },
    });
    if (existingAccount) {
        return prisma_1.prisma.messagingAccount.update({
            where: {
                id: existingAccount.id,
            },
            data: {
                provider: data.provider,
                name: data.name,
                phoneNumberId: data.phoneNumberId,
                businessAccountId: data.businessAccountId,
                accessToken: data.accessToken,
                webhookVerifyToken: data.webhookVerifyToken,
                fromPhoneNumber: data.fromPhoneNumber,
                isActive: data.isActive,
            },
        });
    }
    return prisma_1.prisma.messagingAccount.create({
        data: {
            companyId,
            scope: "COMPANY",
            provider: data.provider || "MOCK",
            name: data.name || "Compte WhatsApp entreprise",
            phoneNumberId: data.phoneNumberId,
            businessAccountId: data.businessAccountId,
            accessToken: data.accessToken,
            webhookVerifyToken: data.webhookVerifyToken,
            fromPhoneNumber: data.fromPhoneNumber,
            isActive: data.isActive ?? false,
            isDefault: false,
        },
    });
};
exports.upsertMyMessagingAccountService = upsertMyMessagingAccountService;
const getPlatformMessagingAccountService = async () => {
    const account = await prisma_1.prisma.messagingAccount.findFirst({
        where: {
            scope: "PLATFORM",
            isDefault: true,
        },
        orderBy: {
            updatedAt: "desc",
        },
    });
    return account;
};
exports.getPlatformMessagingAccountService = getPlatformMessagingAccountService;
const upsertPlatformMessagingAccountService = async (data) => {
    const existingAccount = await prisma_1.prisma.messagingAccount.findFirst({
        where: {
            scope: "PLATFORM",
            isDefault: true,
        },
    });
    if (existingAccount) {
        return prisma_1.prisma.messagingAccount.update({
            where: {
                id: existingAccount.id,
            },
            data: {
                provider: data.provider,
                name: data.name,
                phoneNumberId: data.phoneNumberId,
                businessAccountId: data.businessAccountId,
                accessToken: data.accessToken,
                webhookVerifyToken: data.webhookVerifyToken,
                fromPhoneNumber: data.fromPhoneNumber,
                isActive: data.isActive,
                isDefault: true,
            },
        });
    }
    return prisma_1.prisma.messagingAccount.create({
        data: {
            scope: "PLATFORM",
            provider: data.provider || "META",
            name: data.name || "Jarendata WhatsApp Business",
            phoneNumberId: data.phoneNumberId,
            businessAccountId: data.businessAccountId,
            accessToken: data.accessToken,
            webhookVerifyToken: data.webhookVerifyToken,
            fromPhoneNumber: data.fromPhoneNumber,
            isActive: data.isActive ?? false,
            isDefault: true,
        },
    });
};
exports.upsertPlatformMessagingAccountService = upsertPlatformMessagingAccountService;
const getMessageLogsService = async (companyId, query) => {
    if (!companyId) {
        throw new appError_1.AppError("Entreprise introuvable", 404);
    }
    return (0, pagination_1.paginate)({
        model: prisma_1.prisma.messageLog,
        page: query.page,
        limit: query.limit,
        where: {
            companyId,
            ...(query.campaignId ? { campaignId: query.campaignId } : {}),
            ...(query.contactId ? { contactId: query.contactId } : {}),
            ...(query.direction ? { direction: query.direction } : {}),
            ...(query.status ? { status: query.status } : {}),
        },
        orderBy: { createdAt: "desc" },
        include: {
            messagingAccount: {
                select: {
                    id: true,
                    name: true,
                    scope: true,
                    provider: true,
                },
            },
            campaign: {
                select: {
                    id: true,
                    name: true,
                },
            },
            contact: {
                select: {
                    id: true,
                    fullName: true,
                    phone: true,
                },
            },
        },
    });
};
exports.getMessageLogsService = getMessageLogsService;
const sendCampaignMessagesService = async (companyId, campaignId, data) => {
    if (!companyId) {
        throw new appError_1.AppError("Entreprise introuvable", 404);
    }
    const campaign = await prisma_1.prisma.campaign.findFirst({
        where: {
            id: campaignId,
            companyId,
        },
        include: {
            questions: true,
        },
    });
    if (!campaign) {
        throw new appError_1.AppError("Campagne introuvable", 404);
    }
    if (!["RUNNING", "SCHEDULED"].includes(campaign.status)) {
        throw new appError_1.AppError("La campagne doit être RUNNING ou SCHEDULED pour envoyer les messages", 403);
    }
    if (campaign.questions.length === 0) {
        throw new appError_1.AppError("La campagne ne contient aucune question", 400);
    }
    const limit = data.limit || 50;
    const recipients = await prisma_1.prisma.campaignRecipient.findMany({
        where: {
            campaignId,
            status: "PENDING",
            contact: {
                consentStatus: "ACCEPTED",
            },
        },
        take: limit,
        orderBy: {
            createdAt: "asc",
        },
    });
    let sent = 0;
    let failed = 0;
    for (const recipient of recipients) {
        try {
            await (0, conversation_engine_1.sendFirstQuestionToRecipient)(recipient.id);
            sent += 1;
        }
        catch (error) {
            failed += 1;
            await prisma_1.prisma.campaignRecipient.update({
                where: { id: recipient.id },
                data: {
                    status: "FAILED",
                    failedAt: new Date(),
                    errorMessage: error instanceof Error ? error.message : "Erreur inconnue",
                },
            });
        }
    }
    return {
        totalProcessed: recipients.length,
        sent,
        failed,
    };
};
exports.sendCampaignMessagesService = sendCampaignMessagesService;
