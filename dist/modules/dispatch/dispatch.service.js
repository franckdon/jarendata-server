"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCampaignRecipientsService = exports.updateCampaignRecipientStatusService = exports.getCampaignRecipientStatsService = exports.getCampaignRecipientsService = exports.generateCampaignRecipientsService = exports.previewCampaignRecipientsService = void 0;
const prisma_1 = require("../../config/prisma");
const appError_1 = require("../../utils/appError");
const pagination_1 = require("../../utils/pagination");
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
const buildCampaignAudienceWhere = (campaign) => {
    const where = {
        companyId: campaign.companyId,
        consentStatus: "ACCEPTED",
    };
    if (!campaign.targetAllContacts) {
        if (campaign.countryFilter) {
            where.country = {
                contains: campaign.countryFilter,
                mode: "insensitive",
            };
        }
        if (campaign.cityFilter) {
            where.city = {
                contains: campaign.cityFilter,
                mode: "insensitive",
            };
        }
        if (campaign.tagsFilter && campaign.tagsFilter.length > 0) {
            where.tags = {
                hasSome: campaign.tagsFilter,
            };
        }
    }
    return where;
};
const previewCampaignRecipientsService = async (companyId, campaignId) => {
    const campaign = await ensureCampaignBelongsToCompany(companyId, campaignId);
    const where = buildCampaignAudienceWhere(campaign);
    const [eligibleContactsCount, existingRecipientsCount] = await Promise.all([
        prisma_1.prisma.contact.count({ where }),
        prisma_1.prisma.campaignRecipient.count({
            where: {
                campaignId,
            },
        }),
    ]);
    return {
        eligibleContactsCount,
        existingRecipientsCount,
        estimatedCreditCost: eligibleContactsCount,
        canGenerateRecipients: eligibleContactsCount > 0,
    };
};
exports.previewCampaignRecipientsService = previewCampaignRecipientsService;
const generateCampaignRecipientsService = async (companyId, campaignId) => {
    const campaign = await ensureCampaignBelongsToCompany(companyId, campaignId);
    if (!["DRAFT", "SCHEDULED", "PAUSED"].includes(campaign.status)) {
        throw new appError_1.AppError("Les destinataires ne peuvent être générés que pour une campagne brouillon, programmée ou en pause", 403);
    }
    const where = buildCampaignAudienceWhere(campaign);
    const contacts = await prisma_1.prisma.contact.findMany({
        where,
        select: {
            id: true,
        },
    });
    if (contacts.length === 0) {
        throw new appError_1.AppError("Aucun contact éligible pour cette campagne", 400);
    }
    const company = await prisma_1.prisma.company.findUnique({
        where: {
            id: campaign.companyId,
        },
    });
    if (!company) {
        throw new appError_1.AppError("Entreprise introuvable", 404);
    }
    if (company.creditBalance < contacts.length) {
        throw new appError_1.AppError("Crédits insuffisants pour préparer cette campagne", 403);
    }
    const result = await prisma_1.prisma.$transaction(async (tx) => {
        await tx.campaignRecipient.createMany({
            data: contacts.map((contact) => ({
                campaignId,
                contactId: contact.id,
                status: "PENDING",
            })),
            skipDuplicates: true,
        });
        const recipientsCount = await tx.campaignRecipient.count({
            where: {
                campaignId,
            },
        });
        const updatedCampaign = await tx.campaign.update({
            where: {
                id: campaignId,
            },
            data: {
                estimatedAudienceCount: contacts.length,
                estimatedCreditCost: contacts.length,
            },
        });
        return {
            recipientsCount,
            campaign: updatedCampaign,
        };
    });
    return result;
};
exports.generateCampaignRecipientsService = generateCampaignRecipientsService;
const getCampaignRecipientsService = async (companyId, campaignId, query) => {
    await ensureCampaignBelongsToCompany(companyId, campaignId);
    const search = query.search?.trim();
    const where = {
        campaignId,
        ...(query.status ? { status: query.status } : {}),
        ...(search
            ? {
                contact: {
                    OR: [
                        { fullName: { contains: search, mode: "insensitive" } },
                        { phone: { contains: search, mode: "insensitive" } },
                        { email: { contains: search, mode: "insensitive" } },
                        { city: { contains: search, mode: "insensitive" } },
                        { country: { contains: search, mode: "insensitive" } },
                    ],
                },
            }
            : {}),
    };
    return (0, pagination_1.paginate)({
        model: prisma_1.prisma.campaignRecipient,
        page: query.page,
        limit: query.limit,
        where,
        orderBy: { createdAt: "desc" },
        include: {
            contact: true,
        },
    });
};
exports.getCampaignRecipientsService = getCampaignRecipientsService;
const getCampaignRecipientStatsService = async (companyId, campaignId) => {
    await ensureCampaignBelongsToCompany(companyId, campaignId);
    const [total, pending, sent, delivered, read, responded, failed, cancelled,] = await Promise.all([
        prisma_1.prisma.campaignRecipient.count({ where: { campaignId } }),
        prisma_1.prisma.campaignRecipient.count({ where: { campaignId, status: "PENDING" } }),
        prisma_1.prisma.campaignRecipient.count({ where: { campaignId, status: "SENT" } }),
        prisma_1.prisma.campaignRecipient.count({
            where: { campaignId, status: "DELIVERED" },
        }),
        prisma_1.prisma.campaignRecipient.count({ where: { campaignId, status: "READ" } }),
        prisma_1.prisma.campaignRecipient.count({
            where: { campaignId, status: "RESPONDED" },
        }),
        prisma_1.prisma.campaignRecipient.count({ where: { campaignId, status: "FAILED" } }),
        prisma_1.prisma.campaignRecipient.count({
            where: { campaignId, status: "CANCELLED" },
        }),
    ]);
    return {
        total,
        pending,
        sent,
        delivered,
        read,
        responded,
        failed,
        cancelled,
        responseRate: total > 0 ? Number(((responded / total) * 100).toFixed(2)) : 0,
        failureRate: total > 0 ? Number(((failed / total) * 100).toFixed(2)) : 0,
    };
};
exports.getCampaignRecipientStatsService = getCampaignRecipientStatsService;
const updateCampaignRecipientStatusService = async (companyId, campaignId, recipientId, data) => {
    await ensureCampaignBelongsToCompany(companyId, campaignId);
    const recipient = await prisma_1.prisma.campaignRecipient.findFirst({
        where: {
            id: recipientId,
            campaignId,
        },
    });
    if (!recipient) {
        throw new appError_1.AppError("Destinataire introuvable", 404);
    }
    const now = new Date();
    const updatedRecipient = await prisma_1.prisma.campaignRecipient.update({
        where: {
            id: recipientId,
        },
        data: {
            status: data.status,
            errorMessage: data.errorMessage,
            sentAt: data.status === "SENT" ? now : recipient.sentAt,
            deliveredAt: data.status === "DELIVERED" ? now : recipient.deliveredAt,
            readAt: data.status === "READ" ? now : recipient.readAt,
            respondedAt: data.status === "RESPONDED" ? now : recipient.respondedAt,
            failedAt: data.status === "FAILED" ? now : recipient.failedAt,
        },
        include: {
            contact: true,
        },
    });
    return updatedRecipient;
};
exports.updateCampaignRecipientStatusService = updateCampaignRecipientStatusService;
const clearCampaignRecipientsService = async (companyId, campaignId) => {
    const campaign = await ensureCampaignBelongsToCompany(companyId, campaignId);
    if (!["DRAFT", "SCHEDULED", "PAUSED"].includes(campaign.status)) {
        throw new appError_1.AppError("Les destinataires ne peuvent pas être supprimés pour cette campagne", 403);
    }
    await prisma_1.prisma.campaignRecipient.deleteMany({
        where: {
            campaignId,
            status: "PENDING",
        },
    });
    return true;
};
exports.clearCampaignRecipientsService = clearCampaignRecipientsService;
