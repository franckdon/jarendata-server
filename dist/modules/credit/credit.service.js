"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminGetAllCreditTransactionsService = exports.refundCampaignCreditsService = exports.consumeCreditsForCampaignService = exports.adjustCreditsService = exports.addCreditsService = exports.adminGetCompanyCreditTransactionsService = exports.getMyCreditTransactionsService = exports.getMyCreditBalanceService = void 0;
const prisma_1 = require("../../config/prisma");
const appError_1 = require("../../utils/appError");
const pagination_1 = require("../../utils/pagination");
const getMyCreditBalanceService = async (companyId) => {
    if (!companyId) {
        throw new appError_1.AppError("Entreprise introuvable", 404);
    }
    const company = await prisma_1.prisma.company.findUnique({
        where: { id: companyId },
        select: {
            id: true,
            name: true,
            creditBalance: true,
        },
    });
    if (!company) {
        throw new appError_1.AppError("Entreprise introuvable", 404);
    }
    return company;
};
exports.getMyCreditBalanceService = getMyCreditBalanceService;
const getMyCreditTransactionsService = async (companyId, query) => {
    if (!companyId) {
        throw new appError_1.AppError("Entreprise introuvable", 404);
    }
    return (0, pagination_1.paginate)({
        model: prisma_1.prisma.creditTransaction,
        page: query.page,
        limit: query.limit,
        where: {
            companyId,
            ...(query.type ? { type: query.type } : {}),
            ...(query.reason ? { reason: query.reason } : {}),
        },
        orderBy: { createdAt: "desc" },
        include: {
            campaign: {
                select: {
                    id: true,
                    name: true,
                    status: true,
                },
            },
            createdBy: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    role: true,
                },
            },
        },
    });
};
exports.getMyCreditTransactionsService = getMyCreditTransactionsService;
const adminGetCompanyCreditTransactionsService = async (companyId, query) => {
    const company = await prisma_1.prisma.company.findUnique({
        where: { id: companyId },
    });
    if (!company) {
        throw new appError_1.AppError("Entreprise introuvable", 404);
    }
    return (0, pagination_1.paginate)({
        model: prisma_1.prisma.creditTransaction,
        page: query.page,
        limit: query.limit,
        where: {
            companyId,
            ...(query.type ? { type: query.type } : {}),
            ...(query.reason ? { reason: query.reason } : {}),
        },
        orderBy: { createdAt: "desc" },
        include: {
            campaign: {
                select: {
                    id: true,
                    name: true,
                    status: true,
                },
            },
            createdBy: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    role: true,
                },
            },
        },
    });
};
exports.adminGetCompanyCreditTransactionsService = adminGetCompanyCreditTransactionsService;
const addCreditsService = async (adminUserId, data) => {
    const company = await prisma_1.prisma.company.findUnique({
        where: { id: data.companyId },
    });
    if (!company) {
        throw new appError_1.AppError("Entreprise introuvable", 404);
    }
    const result = await prisma_1.prisma.$transaction(async (tx) => {
        const balanceBefore = company.creditBalance;
        const balanceAfter = balanceBefore + data.amount;
        const updatedCompany = await tx.company.update({
            where: { id: data.companyId },
            data: {
                creditBalance: balanceAfter,
            },
            select: {
                id: true,
                name: true,
                creditBalance: true,
            },
        });
        const transaction = await tx.creditTransaction.create({
            data: {
                companyId: data.companyId,
                createdById: adminUserId,
                type: "CREDIT",
                reason: "ADMIN_TOPUP",
                amount: data.amount,
                balanceBefore,
                balanceAfter,
                description: data.description || "Ajout de crédits par l’administrateur",
            },
        });
        return {
            company: updatedCompany,
            transaction,
        };
    });
    return result;
};
exports.addCreditsService = addCreditsService;
const adjustCreditsService = async (adminUserId, data) => {
    const company = await prisma_1.prisma.company.findUnique({
        where: { id: data.companyId },
    });
    if (!company) {
        throw new appError_1.AppError("Entreprise introuvable", 404);
    }
    if (data.amount === 0) {
        throw new appError_1.AppError("Le montant d’ajustement ne peut pas être zéro", 400);
    }
    const balanceAfter = company.creditBalance + data.amount;
    if (balanceAfter < 0) {
        throw new appError_1.AppError("L’ajustement rendrait le solde négatif", 400);
    }
    const result = await prisma_1.prisma.$transaction(async (tx) => {
        const balanceBefore = company.creditBalance;
        const updatedCompany = await tx.company.update({
            where: { id: data.companyId },
            data: {
                creditBalance: balanceAfter,
            },
            select: {
                id: true,
                name: true,
                creditBalance: true,
            },
        });
        const transaction = await tx.creditTransaction.create({
            data: {
                companyId: data.companyId,
                createdById: adminUserId,
                type: "ADJUSTMENT",
                reason: "MANUAL_ADJUSTMENT",
                amount: data.amount,
                balanceBefore,
                balanceAfter,
                description: data.description || "Ajustement manuel du solde de crédits",
            },
        });
        return {
            company: updatedCompany,
            transaction,
        };
    });
    return result;
};
exports.adjustCreditsService = adjustCreditsService;
const consumeCreditsForCampaignService = async ({ companyId, campaignId, userId, amount, description, }) => {
    if (amount <= 0) {
        throw new appError_1.AppError("Le montant de crédits à consommer est invalide", 400);
    }
    const company = await prisma_1.prisma.company.findUnique({
        where: { id: companyId },
    });
    if (!company) {
        throw new appError_1.AppError("Entreprise introuvable", 404);
    }
    if (company.creditBalance < amount) {
        throw new appError_1.AppError("Crédits insuffisants", 403);
    }
    const alreadyDebited = await prisma_1.prisma.creditTransaction.findFirst({
        where: {
            companyId,
            campaignId,
            type: "DEBIT",
            reason: "CAMPAIGN_LAUNCH",
        },
    });
    if (alreadyDebited) {
        throw new appError_1.AppError("Les crédits ont déjà été consommés pour cette campagne", 409);
    }
    const result = await prisma_1.prisma.$transaction(async (tx) => {
        const balanceBefore = company.creditBalance;
        const balanceAfter = balanceBefore - amount;
        const updatedCompany = await tx.company.update({
            where: { id: companyId },
            data: {
                creditBalance: balanceAfter,
            },
            select: {
                id: true,
                name: true,
                creditBalance: true,
            },
        });
        const transaction = await tx.creditTransaction.create({
            data: {
                companyId,
                campaignId,
                createdById: userId || null,
                type: "DEBIT",
                reason: "CAMPAIGN_LAUNCH",
                amount,
                balanceBefore,
                balanceAfter,
                description: description || `Consommation de ${amount} crédit(s) pour lancement de campagne`,
            },
        });
        return {
            company: updatedCompany,
            transaction,
        };
    });
    return result;
};
exports.consumeCreditsForCampaignService = consumeCreditsForCampaignService;
const refundCampaignCreditsService = async ({ companyId, campaignId, userId, amount, description, }) => {
    if (amount <= 0) {
        throw new appError_1.AppError("Le montant de remboursement est invalide", 400);
    }
    const company = await prisma_1.prisma.company.findUnique({
        where: { id: companyId },
    });
    if (!company) {
        throw new appError_1.AppError("Entreprise introuvable", 404);
    }
    const result = await prisma_1.prisma.$transaction(async (tx) => {
        const balanceBefore = company.creditBalance;
        const balanceAfter = balanceBefore + amount;
        const updatedCompany = await tx.company.update({
            where: { id: companyId },
            data: {
                creditBalance: balanceAfter,
            },
            select: {
                id: true,
                name: true,
                creditBalance: true,
            },
        });
        const transaction = await tx.creditTransaction.create({
            data: {
                companyId,
                campaignId,
                createdById: userId || null,
                type: "REFUND",
                reason: "CAMPAIGN_REFUND",
                amount,
                balanceBefore,
                balanceAfter,
                description: description || `Remboursement de ${amount} crédit(s) pour campagne`,
            },
        });
        return {
            company: updatedCompany,
            transaction,
        };
    });
    return result;
};
exports.refundCampaignCreditsService = refundCampaignCreditsService;
const adminGetAllCreditTransactionsService = async (query) => {
    return (0, pagination_1.paginate)({
        model: prisma_1.prisma.creditTransaction,
        page: query.page,
        limit: query.limit,
        where: {
            ...(query.companyId ? { companyId: query.companyId } : {}),
            ...(query.type ? { type: query.type } : {}),
            ...(query.reason ? { reason: query.reason } : {}),
        },
        orderBy: { createdAt: "desc" },
        include: {
            company: {
                select: {
                    id: true,
                    name: true,
                    creditBalance: true,
                },
            },
            campaign: {
                select: {
                    id: true,
                    name: true,
                    status: true,
                },
            },
            createdBy: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    role: true,
                },
            },
        },
    });
};
exports.adminGetAllCreditTransactionsService = adminGetAllCreditTransactionsService;
