"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveMessagingAccountForCompany = void 0;
const prisma_1 = require("../../config/prisma");
const appError_1 = require("../../utils/appError");
const resolveMessagingAccountForCompany = async (companyId) => {
    const companyAccount = await prisma_1.prisma.messagingAccount.findFirst({
        where: {
            companyId,
            scope: "COMPANY",
            isActive: true,
        },
        orderBy: {
            updatedAt: "desc",
        },
    });
    if (companyAccount) {
        return companyAccount;
    }
    const platformAccount = await prisma_1.prisma.messagingAccount.findFirst({
        where: {
            scope: "PLATFORM",
            isDefault: true,
            isActive: true,
        },
        orderBy: {
            updatedAt: "desc",
        },
    });
    if (!platformAccount) {
        throw new appError_1.AppError("Aucun compte WhatsApp actif disponible. Configurez le compte Jarendata par défaut ou le compte de l’entreprise.", 400);
    }
    return platformAccount;
};
exports.resolveMessagingAccountForCompany = resolveMessagingAccountForCompany;
