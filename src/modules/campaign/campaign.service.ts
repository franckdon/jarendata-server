import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/appError";
import { paginate } from "../../utils/pagination";
import {
  CampaignQuery,
  CreateCampaignInput,
  UpdateCampaignInput,
  UpdateCampaignStatusInput,
} from "./campaign.validation";

const buildAudienceWhere = (
  companyId: string,
  data: {
    targetAllContacts?: boolean;
    countryFilter?: string;
    cityFilter?: string;
    tagsFilter?: string[];
  }
) => {
  const where: any = {
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

const estimateCampaignAudience = async (
  companyId: string,
  data: {
    targetAllContacts?: boolean;
    countryFilter?: string;
    cityFilter?: string;
    tagsFilter?: string[];
  }
) => {
  const where = buildAudienceWhere(companyId, data);

  const count = await prisma.contact.count({
    where,
  });

  return {
    estimatedAudienceCount: count,
    estimatedCreditCost: count,
  };
};

export const getCampaignsService = async (
  companyId: string | null | undefined,
  query: CampaignQuery
) => {
  if (!companyId) {
    throw new AppError("Entreprise introuvable", 404);
  }

  const search = query.search?.trim();

  const where: any = {
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

  return paginate({
    model: prisma.campaign,
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

export const createCampaignService = async (
  companyId: string | null | undefined,
  userId: string,
  data: CreateCampaignInput
) => {
  if (!companyId) {
    throw new AppError("Entreprise introuvable", 404);
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    throw new AppError("Entreprise introuvable", 404);
  }

  if (company.status !== "ACTIVE") {
    throw new AppError("Votre entreprise doit être activée avant de créer une campagne", 403);
  }

  const estimation = await estimateCampaignAudience(companyId, {
    targetAllContacts: data.targetAllContacts,
    countryFilter: data.countryFilter,
    cityFilter: data.cityFilter,
    tagsFilter: data.tagsFilter,
  });

  const campaign = await prisma.campaign.create({
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

export const getCampaignByIdService = async (
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
    throw new AppError("Campagne introuvable", 404);
  }

  return campaign;
};

export const updateCampaignService = async (
  companyId: string | null | undefined,
  campaignId: string,
  data: UpdateCampaignInput
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

  if (!["DRAFT", "SCHEDULED", "PAUSED"].includes(campaign.status)) {
    throw new AppError("Cette campagne ne peut plus être modifiée", 403);
  }

  const shouldRecalculateAudience =
    data.targetAllContacts !== undefined ||
    data.countryFilter !== undefined ||
    data.cityFilter !== undefined ||
    data.tagsFilter !== undefined;

  let estimation:
    | {
        estimatedAudienceCount: number;
        estimatedCreditCost: number;
      }
    | undefined;

  if (shouldRecalculateAudience) {
    estimation = await estimateCampaignAudience(companyId, {
      targetAllContacts: data.targetAllContacts ?? campaign.targetAllContacts,
      countryFilter: data.countryFilter ?? campaign.countryFilter ?? undefined,
      cityFilter: data.cityFilter ?? campaign.cityFilter ?? undefined,
      tagsFilter: data.tagsFilter ?? campaign.tagsFilter,
    });
  }

  const updatedCampaign = await prisma.campaign.update({
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

export const deleteCampaignService = async (
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

  if (campaign.status !== "DRAFT") {
    throw new AppError("Seules les campagnes brouillon peuvent être supprimées", 403);
  }

  await prisma.campaign.delete({
    where: {
      id: campaignId,
    },
  });

  return true;
};

export const updateCampaignStatusService = async (
  companyId: string | null | undefined,
  campaignId: string,
  data: UpdateCampaignStatusInput
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

  if (data.status === "RUNNING") {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new AppError("Entreprise introuvable", 404);
    }

    if (company.creditBalance < campaign.estimatedCreditCost) {
      throw new AppError("Crédits insuffisants pour lancer cette campagne", 403);
    }
  }

  const updatedCampaign = await prisma.campaign.update({
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