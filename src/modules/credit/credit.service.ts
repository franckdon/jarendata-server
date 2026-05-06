import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/appError";
import { paginate } from "../../utils/pagination";
import {
  AddCreditsInput,
  AdjustCreditsInput,
  CreditQuery,
} from "./credit.validation";

export const getMyCreditBalanceService = async (
  companyId: string | null | undefined
) => {
  if (!companyId) {
    throw new AppError("Entreprise introuvable", 404);
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      id: true,
      name: true,
      creditBalance: true,
    },
  });

  if (!company) {
    throw new AppError("Entreprise introuvable", 404);
  }

  return company;
};

export const getMyCreditTransactionsService = async (
  companyId: string | null | undefined,
  query: CreditQuery
) => {
  if (!companyId) {
    throw new AppError("Entreprise introuvable", 404);
  }

  return paginate({
    model: prisma.creditTransaction,
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

export const adminGetCompanyCreditTransactionsService = async (
  companyId: string,
  query: CreditQuery
) => {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    throw new AppError("Entreprise introuvable", 404);
  }

  return paginate({
    model: prisma.creditTransaction,
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

export const addCreditsService = async (
  adminUserId: string,
  data: AddCreditsInput
) => {
  const company = await prisma.company.findUnique({
    where: { id: data.companyId },
  });

  if (!company) {
    throw new AppError("Entreprise introuvable", 404);
  }

  const result = await prisma.$transaction(async (tx) => {
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

export const adjustCreditsService = async (
  adminUserId: string,
  data: AdjustCreditsInput
) => {
  const company = await prisma.company.findUnique({
    where: { id: data.companyId },
  });

  if (!company) {
    throw new AppError("Entreprise introuvable", 404);
  }

  if (data.amount === 0) {
    throw new AppError("Le montant d’ajustement ne peut pas être zéro", 400);
  }

  const balanceAfter = company.creditBalance + data.amount;

  if (balanceAfter < 0) {
    throw new AppError("L’ajustement rendrait le solde négatif", 400);
  }

  const result = await prisma.$transaction(async (tx) => {
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

export const consumeCreditsForCampaignService = async ({
  companyId,
  campaignId,
  userId,
  amount,
  description,
}: {
  companyId: string;
  campaignId: string;
  userId?: string | null;
  amount: number;
  description?: string;
}) => {
  if (amount <= 0) {
    throw new AppError("Le montant de crédits à consommer est invalide", 400);
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    throw new AppError("Entreprise introuvable", 404);
  }

  if (company.creditBalance < amount) {
    throw new AppError("Crédits insuffisants", 403);
  }

  const alreadyDebited = await prisma.creditTransaction.findFirst({
    where: {
      companyId,
      campaignId,
      type: "DEBIT",
      reason: "CAMPAIGN_LAUNCH",
    },
  });

  if (alreadyDebited) {
    throw new AppError("Les crédits ont déjà été consommés pour cette campagne", 409);
  }

  const result = await prisma.$transaction(async (tx) => {
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
        description:
          description || `Consommation de ${amount} crédit(s) pour lancement de campagne`,
      },
    });

    return {
      company: updatedCompany,
      transaction,
    };
  });

  return result;
};

export const refundCampaignCreditsService = async ({
  companyId,
  campaignId,
  userId,
  amount,
  description,
}: {
  companyId: string;
  campaignId: string;
  userId?: string | null;
  amount: number;
  description?: string;
}) => {
  if (amount <= 0) {
    throw new AppError("Le montant de remboursement est invalide", 400);
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    throw new AppError("Entreprise introuvable", 404);
  }

  const result = await prisma.$transaction(async (tx) => {
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
        description:
          description || `Remboursement de ${amount} crédit(s) pour campagne`,
      },
    });

    return {
      company: updatedCompany,
      transaction,
    };
  });

  return result;
};

export const adminGetAllCreditTransactionsService = async (
  query: CreditQuery
) => {
  return paginate({
    model: prisma.creditTransaction,
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