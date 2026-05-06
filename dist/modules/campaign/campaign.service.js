"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCampaignStatusService = exports.deleteCampaignService = exports.updateCampaignService = exports.getCampaignByIdService = exports.createCampaignService = exports.getCampaignsService = void 0;
const prisma_1 = require("../../config/prisma");
const appError_1 = require("../../utils/appError");
const pagination_1 = require("../../utils/pagination");
const credit_service_1 = require("../credit/credit.service");
const buildAudienceWhere = (companyId, data) => {
    const where = {
        companyId,
        consentStatus: "ACCEPTED",
    };
    if (!data.targetAllContacts) {
        if (data.countryFilter) {
            where.country = {
                contains: data.countryFilter,
                mode: "insensitive",
            };
        }
        if (data.cityFilter) {
            where.city = {
                contains: data.cityFilter,
                mode: "insensitive",
            };
        }
        if (data.tagsFilter && data.tagsFilter.length > 0) {
            where.tags = {
                hasSome: data.tagsFilter,
            };
        }
    }
    return where;
};
const estimateCampaignAudience = async (companyId, data) => {
    const where = buildAudienceWhere(companyId, data);
    const count = await prisma_1.prisma.contact.count({
        where,
    });
    return {
        estimatedAudienceCount: count,
        estimatedCreditCost: count,
    };
};
const getCampaignsService = async (companyId, query) => {
    if (!companyId) {
        throw new appError_1.AppError("Entreprise introuvable", 404);
    }
    const search = query.search?.trim();
    const where = {
        companyId,
        ...(query.status ? { status: query.status } : {}),
        ...(query.type ? { type: query.type } : {}),
        ...(search
            ? {
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { description: { contains: search, mode: "insensitive" } },
                ],
            }
            : {}),
    };
    return (0, pagination_1.paginate)({
        model: prisma_1.prisma.campaign,
        page: query.page,
        limit: query.limit,
        where,
        orderBy: { createdAt: "desc" },
        include: {
            createdBy: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                },
            },
        },
    });
};
exports.getCampaignsService = getCampaignsService;
const createCampaignService = async (companyId, userId, data) => {
    if (!companyId) {
        throw new appError_1.AppError("Entreprise introuvable", 404);
    }
    const company = await prisma_1.prisma.company.findUnique({
        where: { id: companyId },
    });
    if (!company) {
        throw new appError_1.AppError("Entreprise introuvable", 404);
    }
    if (company.status !== "ACTIVE") {
        throw new appError_1.AppError("Votre entreprise doit être activée avant de créer une campagne", 403);
    }
    const estimation = await estimateCampaignAudience(companyId, {
        targetAllContacts: data.targetAllContacts,
        countryFilter: data.countryFilter,
        cityFilter: data.cityFilter,
        tagsFilter: data.tagsFilter,
    });
    const campaign = await prisma_1.prisma.campaign.create({
        data: {
            companyId,
            createdById: userId,
            name: data.name,
            description: data.description,
            type: data.type || "CUSTOM",
            targetAllContacts: data.targetAllContacts || false,
            countryFilter: data.countryFilter,
            cityFilter: data.cityFilter,
            tagsFilter: data.tagsFilter || [],
            scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
            estimatedAudienceCount: estimation.estimatedAudienceCount,
            estimatedCreditCost: estimation.estimatedCreditCost,
            status: data.scheduledAt ? "SCHEDULED" : "DRAFT",
        },
    });
    return campaign;
};
exports.createCampaignService = createCampaignService;
const getCampaignByIdService = async (companyId, campaignId) => {
    if (!companyId) {
        throw new appError_1.AppError("Entreprise introuvable", 404);
    }
    const campaign = await prisma_1.prisma.campaign.findFirst({
        where: {
            id: campaignId,
            companyId,
        },
        include: {
            createdBy: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                },
            },
        },
    });
    if (!campaign) {
        throw new appError_1.AppError("Campagne introuvable", 404);
    }
    return campaign;
};
exports.getCampaignByIdService = getCampaignByIdService;
const updateCampaignService = async (companyId, campaignId, data) => {
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
        throw new appError_1.AppError("Cette campagne ne peut plus être modifiée", 403);
    }
    const shouldRecalculateAudience = data.targetAllContacts !== undefined ||
        data.countryFilter !== undefined ||
        data.cityFilter !== undefined ||
        data.tagsFilter !== undefined;
    let estimation;
    if (shouldRecalculateAudience) {
        estimation = await estimateCampaignAudience(companyId, {
            targetAllContacts: data.targetAllContacts ?? campaign.targetAllContacts,
            countryFilter: data.countryFilter ?? campaign.countryFilter ?? undefined,
            cityFilter: data.cityFilter ?? campaign.cityFilter ?? undefined,
            tagsFilter: data.tagsFilter ?? campaign.tagsFilter,
        });
    }
    const updatedCampaign = await prisma_1.prisma.campaign.update({
        where: {
            id: campaignId,
        },
        data: {
            ...data,
            scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
            ...(estimation ? estimation : {}),
            ...(data.scheduledAt ? { status: "SCHEDULED" } : {}),
        },
    });
    return updatedCampaign;
};
exports.updateCampaignService = updateCampaignService;
const deleteCampaignService = async (companyId, campaignId) => {
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
    if (campaign.status !== "DRAFT") {
        throw new appError_1.AppError("Seules les campagnes brouillon peuvent être supprimées", 403);
    }
    await prisma_1.prisma.campaign.delete({
        where: {
            id: campaignId,
        },
    });
    return true;
};
exports.deleteCampaignService = deleteCampaignService;
const updateCampaignStatusService = async (companyId, userId, campaignId, data) => {
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
    if (data.status === "RUNNING") {
        const company = await prisma_1.prisma.company.findUnique({
            where: { id: companyId },
        });
        if (!company) {
            throw new appError_1.AppError("Entreprise introuvable", 404);
        }
        if (company.creditBalance < campaign.estimatedCreditCost) {
            throw new appError_1.AppError("Crédits insuffisants pour lancer cette campagne", 403);
        }
        await (0, credit_service_1.consumeCreditsForCampaignService)({
            companyId,
            campaignId,
            userId,
            amount: campaign.estimatedCreditCost,
            description: `Lancement de la campagne : ${campaign.name}`,
        });
    }
    const updatedCampaign = await prisma_1.prisma.campaign.update({
        where: {
            id: campaignId,
        },
        data: {
            status: data.status,
            startedAt: data.status === "RUNNING" ? new Date() : campaign.startedAt,
            completedAt: data.status === "COMPLETED" ? new Date() : campaign.completedAt,
        },
    });
    return updatedCampaign;
};
exports.updateCampaignStatusService = updateCampaignStatusService;
