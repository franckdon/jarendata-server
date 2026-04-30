import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/appError";

export const resolveMessagingAccountForCompany = async (companyId: string) => {
  const companyAccount = await prisma.messagingAccount.findFirst({
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

  const platformAccount = await prisma.messagingAccount.findFirst({
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
    throw new AppError(
      "Aucun compte WhatsApp actif disponible. Configurez le compte Jarendata par défaut ou le compte de l’entreprise.",
      400
    );
  }

  return platformAccount;
};