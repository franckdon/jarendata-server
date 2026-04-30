import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/appError";
import { paginate } from "../../utils/pagination";
import { sendFirstQuestionToRecipient } from "./conversation.engine";
import {
  SendCampaignMessagesInput,
  UpsertCompanyMessagingAccountInput,
  UpsertPlatformMessagingAccountInput,
} from "./messaging.validation";

export const getMyMessagingAccountService = async (
  companyId: string | null | undefined
) => {
  if (!companyId) {
    throw new AppError("Entreprise introuvable", 404);
  }

  const account = await prisma.messagingAccount.findFirst({
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

export const upsertMyMessagingAccountService = async (
  companyId: string | null | undefined,
  data: UpsertCompanyMessagingAccountInput
) => {
  if (!companyId) {
    throw new AppError("Entreprise introuvable", 404);
  }

  const existingAccount = await prisma.messagingAccount.findFirst({
    where: {
      companyId,
      scope: "COMPANY",
    },
  });

  if (existingAccount) {
    return prisma.messagingAccount.update({
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

  return prisma.messagingAccount.create({
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

export const getPlatformMessagingAccountService = async () => {
  const account = await prisma.messagingAccount.findFirst({
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

export const upsertPlatformMessagingAccountService = async (
  data: UpsertPlatformMessagingAccountInput
) => {
  const existingAccount = await prisma.messagingAccount.findFirst({
    where: {
      scope: "PLATFORM",
      isDefault: true,
    },
  });

  if (existingAccount) {
    return prisma.messagingAccount.update({
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

  return prisma.messagingAccount.create({
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

export const getMessageLogsService = async (
  companyId: string | null | undefined,
  query: any
) => {
  if (!companyId) {
    throw new AppError("Entreprise introuvable", 404);
  }

  return paginate({
    model: prisma.messageLog,
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

export const sendCampaignMessagesService = async (
  companyId: string | null | undefined,
  campaignId: string,
  data: SendCampaignMessagesInput
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
      questions: true,
    },
  });

  if (!campaign) {
    throw new AppError("Campagne introuvable", 404);
  }

  if (!["RUNNING", "SCHEDULED"].includes(campaign.status)) {
    throw new AppError(
      "La campagne doit être RUNNING ou SCHEDULED pour envoyer les messages",
      403
    );
  }

  if (campaign.questions.length === 0) {
    throw new AppError("La campagne ne contient aucune question", 400);
  }

  const limit = data.limit || 50;

  const recipients = await prisma.campaignRecipient.findMany({
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
      await sendFirstQuestionToRecipient(recipient.id);
      sent += 1;
    } catch (error) {
      failed += 1;

      await prisma.campaignRecipient.update({
        where: { id: recipient.id },
        data: {
          status: "FAILED",
          failedAt: new Date(),
          errorMessage:
            error instanceof Error ? error.message : "Erreur inconnue",
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