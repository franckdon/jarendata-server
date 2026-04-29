import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/appError";
import { paginate } from "../../utils/pagination";
import {
  ContactQuery,
  CreateContactInput,
  UpdateContactInput,
} from "./audience.validation";

const normalizePhone = (phone: string) => {
  return phone.replace(/\s+/g, "").trim();
};

export const getContactsService = async (
  companyId: string | null | undefined,
  query: ContactQuery
) => {
  if (!companyId) {
    throw new AppError("Entreprise introuvable", 404);
  }

  const search = query.search?.trim();

  const where: any = {
    companyId,
    ...(query.source ? { source: query.source } : {}),
    ...(query.consentStatus ? { consentStatus: query.consentStatus } : {}),
    ...(query.country
      ? { country: { contains: query.country, mode: "insensitive" } }
      : {}),
    ...(query.city
      ? { city: { contains: query.city, mode: "insensitive" } }
      : {}),
    ...(search
      ? {
          OR: [
            { fullName: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { country: { contains: search, mode: "insensitive" } },
            { city: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  return paginate({
    model: prisma.contact,
    page: query.page,
    limit: query.limit,
    where,
    orderBy: { createdAt: "desc" },
  });
};

export const createContactService = async (
  companyId: string | null | undefined,
  data: CreateContactInput
) => {
  if (!companyId) {
    throw new AppError("Entreprise introuvable", 404);
  }

  const phone = normalizePhone(data.phone);

  const existingContact = await prisma.contact.findUnique({
    where: {
      companyId_phone: {
        companyId,
        phone,
      },
    },
  });

  if (existingContact) {
    throw new AppError("Ce contact existe déjà dans votre audience", 409);
  }

  const contact = await prisma.contact.create({
    data: {
      companyId,
      fullName: data.fullName,
      phone,
      email: data.email,
      country: data.country,
      city: data.city,
      gender: data.gender,
      ageRange: data.ageRange,
      source: data.source || "MANUAL",
      consentStatus: data.consentStatus || "PENDING",
      tags: data.tags || [],
    },
  });

  return contact;
};

export const getContactByIdService = async (
  companyId: string | null | undefined,
  contactId: string
) => {
  if (!companyId) {
    throw new AppError("Entreprise introuvable", 404);
  }

  const contact = await prisma.contact.findFirst({
    where: {
      id: contactId,
      companyId,
    },
  });

  if (!contact) {
    throw new AppError("Contact introuvable", 404);
  }

  return contact;
};

export const updateContactService = async (
  companyId: string | null | undefined,
  contactId: string,
  data: UpdateContactInput
) => {
  if (!companyId) {
    throw new AppError("Entreprise introuvable", 404);
  }

  const contact = await prisma.contact.findFirst({
    where: {
      id: contactId,
      companyId,
    },
  });

  if (!contact) {
    throw new AppError("Contact introuvable", 404);
  }

  let phone = data.phone ? normalizePhone(data.phone) : undefined;

  if (phone && phone !== contact.phone) {
    const existingContact = await prisma.contact.findUnique({
      where: {
        companyId_phone: {
          companyId,
          phone,
        },
      },
    });

    if (existingContact) {
      throw new AppError("Un autre contact utilise déjà ce numéro", 409);
    }
  }

  const updatedContact = await prisma.contact.update({
    where: {
      id: contactId,
    },
    data: {
      ...data,
      ...(phone ? { phone } : {}),
    },
  });

  return updatedContact;
};

export const deleteContactService = async (
  companyId: string | null | undefined,
  contactId: string
) => {
  if (!companyId) {
    throw new AppError("Entreprise introuvable", 404);
  }

  const contact = await prisma.contact.findFirst({
    where: {
      id: contactId,
      companyId,
    },
  });

  if (!contact) {
    throw new AppError("Contact introuvable", 404);
  }

  await prisma.contact.delete({
    where: {
      id: contactId,
    },
  });

  return true;
};