import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/appError";
import { paginate } from "../../utils/pagination";
import {
  RecipientQuery,
  UpdateRecipientStatusInput,
} from "./dispatch.validation";

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

const buildCampaignAudienceWhere = (campaign: {
  companyId: string;
  targetAllContacts: boolean;
  countryFilter: string | null;
  cityFilter: string | null;
  tagsFilter: string[];
}) => {
  const where: any = {
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

export const previewCampaignRecipientsService = async (
  companyId: string | null | undefined,
  campaignId: string
) => {
  const campaign = await ensureCampaignBelongsToCompany(companyId, campaignId);

  const where = buildCampaignAudienceWhere(campaign);

  const [eligibleContactsCount, existingRecipientsCount] = await Promise.all([
    prisma.contact.count({ where }),
    prisma.campaignRecipient.count({
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

export const generateCampaignRecipientsService = async (
  companyId: string | null | undefined,
  campaignId: string
) => {
  const campaign = await ensureCampaignBelongsToCompany(companyId, campaignId);

  if (!["DRAFT", "SCHEDULED", "PAUSED"].includes(campaign.status)) {
    throw new AppError(
      "Les destinataires ne peuvent être générés que pour une campagne brouillon, programmée ou en pause",
      403
    );
  }

  const where = buildCampaignAudienceWhere(campaign);

  const contacts = await prisma.contact.findMany({
    where,
    select: {
      id: true,
    },
  });

  if (contacts.length === 0) {
    throw new AppError("Aucun contact éligible pour cette campagne", 400);
  }

  const company = await prisma.company.findUnique({
    where: {
      id: campaign.companyId,
    },
  });

  if (!company) {
    throw new AppError("Entreprise introuvable", 404);
  }

  if (company.creditBalance < contacts.length) {
    throw new AppError("Crédits insuffisants pour préparer cette campagne", 403);
  }

  const result = await prisma.$transaction(async (tx) => {
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

export const getCampaignRecipientsService = async (
  companyId: string | null | undefined,
  campaignId: string,
  query: RecipientQuery
) => {
  await ensureCampaignBelongsToCompany(companyId, campaignId);

  const search = query.search?.trim();

  const where: any = {
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

  return paginate({
    model: prisma.campaignRecipient,
    page: query.page,
    limit: query.limit,
    where,
    orderBy: { createdAt: "desc" },
    include: {
      contact: true,
    },
  });
};

export const getCampaignRecipientStatsService = async (
  companyId: string | null | undefined,
  campaignId: string
) => {
  await ensureCampaignBelongsToCompany(companyId, campaignId);

  const [
    total,
    pending,
    sent,
    delivered,
    read,
    responded,
    failed,
    cancelled,
  ] = await Promise.all([
    prisma.campaignRecipient.count({ where: { campaignId } }),
    prisma.campaignRecipient.count({ where: { campaignId, status: "PENDING" } }),
    prisma.campaignRecipient.count({ where: { campaignId, status: "SENT" } }),
    prisma.campaignRecipient.count({
      where: { campaignId, status: "DELIVERED" },
    }),
    prisma.campaignRecipient.count({ where: { campaignId, status: "READ" } }),
    prisma.campaignRecipient.count({
      where: { campaignId, status: "RESPONDED" },
    }),
    prisma.campaignRecipient.count({ where: { campaignId, status: "FAILED" } }),
    prisma.campaignRecipient.count({
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

export const updateCampaignRecipientStatusService = async (
  companyId: string | null | undefined,
  campaignId: string,
  recipientId: string,
  data: UpdateRecipientStatusInput
) => {
  await ensureCampaignBelongsToCompany(companyId, campaignId);

  const recipient = await prisma.campaignRecipient.findFirst({
    where: {
      id: recipientId,
      campaignId,
    },
  });

  if (!recipient) {
    throw new AppError("Destinataire introuvable", 404);
  }

  const now = new Date();

  const updatedRecipient = await prisma.campaignRecipient.update({
    where: {
      id: recipientId,
    },
    data: {
      status: data.status,
      errorMessage: data.errorMessage,
      sentAt: data.status === "SENT" ? now : recipient.sentAt,
      deliveredAt:
        data.status === "DELIVERED" ? now : recipient.deliveredAt,
      readAt: data.status === "READ" ? now : recipient.readAt,
      respondedAt:
        data.status === "RESPONDED" ? now : recipient.respondedAt,
      failedAt: data.status === "FAILED" ? now : recipient.failedAt,
    },
    include: {
      contact: true,
    },
  });

  return updatedRecipient;
};

export const clearCampaignRecipientsService = async (
  companyId: string | null | undefined,
  campaignId: string
) => {
  const campaign = await ensureCampaignBelongsToCompany(companyId, campaignId);

  if (!["DRAFT", "SCHEDULED", "PAUSED"].includes(campaign.status)) {
    throw new AppError(
      "Les destinataires ne peuvent pas être supprimés pour cette campagne",
      403
    );
  }

  await prisma.campaignRecipient.deleteMany({
    where: {
      campaignId,
      status: "PENDING",
    },
  });

  return true;
};