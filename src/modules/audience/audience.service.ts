import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/appError";
import { paginate } from "../../utils/pagination";
import {
  ContactQuery,
  CreateContactInput,
  ImportContactsInput,
  OptInContactInput,
  SyncContactInput,
  UpdateContactInput,
} from "./audience.validation";

const normalizePhone = (phone: string) => {
  return phone.replace(/\s+/g, "").trim();
};

const mergeTags = (tagsA: string[] = [], tagsB: string[] = []) => {
  return Array.from(new Set([...tagsA, ...tagsB].filter(Boolean)));
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
            { externalId: { contains: search, mode: "insensitive" } },
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

  if (data.externalId) {
    const existingExternal = await prisma.contact.findUnique({
      where: {
        companyId_externalId: {
          companyId,
          externalId: data.externalId,
        },
      },
    });

    if (existingExternal) {
      throw new AppError("Un contact avec cet identifiant externe existe déjà", 409);
    }
  }

  const consentStatus = data.consentStatus || "PENDING";

  return prisma.contact.create({
    data: {
      companyId,
      fullName: data.fullName,
      phone,
      email: data.email,
      country: data.country,
      city: data.city,
      gender: data.gender,
      ageRange: data.ageRange,
      externalId: data.externalId,
      metadata: data.metadata,
      source: data.source || "MANUAL",
      consentStatus,
      optInAt: consentStatus === "ACCEPTED" ? new Date() : undefined,
      consentText: data.consentText,
      tags: data.tags || [],
    },
  });
};

export const importContactsService = async (
  companyId: string | null | undefined,
  data: ImportContactsInput
) => {
  if (!companyId) {
    throw new AppError("Entreprise introuvable", 404);
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;

  const errors: Array<{
    phone?: string;
    email?: string;
    reason: string;
  }> = [];

  for (const item of data.contacts) {
    try {
      const phone = normalizePhone(item.phone);

      const existingContact = await prisma.contact.findUnique({
        where: {
          companyId_phone: {
            companyId,
            phone,
          },
        },
      });

      const finalTags = mergeTags(item.tags || [], data.defaultTags || []);
      const consentStatus = item.consentStatus || data.consentStatus || "PENDING";

      if (existingContact) {
        await prisma.contact.update({
          where: { id: existingContact.id },
          data: {
            fullName: item.fullName ?? existingContact.fullName,
            email: item.email ?? existingContact.email,
            country: item.country ?? existingContact.country,
            city: item.city ?? existingContact.city,
            gender: item.gender ?? existingContact.gender,
            ageRange: item.ageRange ?? existingContact.ageRange,
            externalId: item.externalId ?? existingContact.externalId,
            metadata: item.metadata ?? existingContact.metadata,
            source: "IMPORT",
            consentStatus,
            optInAt:
              consentStatus === "ACCEPTED"
                ? existingContact.optInAt || new Date()
                : existingContact.optInAt,
            consentText: item.consentText ?? existingContact.consentText,
            tags: mergeTags(existingContact.tags, finalTags),
          },
        });

        updated += 1;
      } else {
        await prisma.contact.create({
          data: {
            companyId,
            fullName: item.fullName,
            phone,
            email: item.email,
            country: item.country,
            city: item.city,
            gender: item.gender,
            ageRange: item.ageRange,
            externalId: item.externalId,
            metadata: item.metadata,
            source: "IMPORT",
            consentStatus,
            optInAt: consentStatus === "ACCEPTED" ? new Date() : undefined,
            consentText: item.consentText,
            tags: finalTags,
          },
        });

        created += 1;
      }
    } catch (error) {
      skipped += 1;
      errors.push({
        phone: item.phone,
        email: item.email,
        reason: error instanceof Error ? error.message : "Erreur inconnue",
      });
    }
  }

  return {
    created,
    updated,
    skipped,
    total: data.contacts.length,
    errors,
  };
};

export const syncContactFromApiService = async (
  companyId: string | null | undefined,
  data: SyncContactInput
) => {
  if (!companyId) {
    throw new AppError("Entreprise introuvable", 404);
  }

  const phone = normalizePhone(data.phone);
  const consentStatus = data.consentStatus || "PENDING";

  const existingByExternalId = await prisma.contact.findUnique({
    where: {
      companyId_externalId: {
        companyId,
        externalId: data.externalId,
      },
    },
  });

  if (existingByExternalId) {
    const contact = await prisma.contact.update({
      where: { id: existingByExternalId.id },
      data: {
        fullName: data.fullName ?? existingByExternalId.fullName,
        phone,
        email: data.email ?? existingByExternalId.email,
        country: data.country ?? existingByExternalId.country,
        city: data.city ?? existingByExternalId.city,
        gender: data.gender ?? existingByExternalId.gender,
        ageRange: data.ageRange ?? existingByExternalId.ageRange,
        metadata: data.metadata ?? existingByExternalId.metadata,
        source: "API",
        consentStatus,
        optInAt:
          consentStatus === "ACCEPTED"
            ? existingByExternalId.optInAt || new Date()
            : existingByExternalId.optInAt,
        tags: mergeTags(existingByExternalId.tags, data.tags || []),
      },
    });

    return {
      action: "updated",
      contact,
    };
  }

  const existingByPhone = await prisma.contact.findUnique({
    where: {
      companyId_phone: {
        companyId,
        phone,
      },
    },
  });

  if (existingByPhone) {
    const contact = await prisma.contact.update({
      where: { id: existingByPhone.id },
      data: {
        externalId: data.externalId,
        fullName: data.fullName ?? existingByPhone.fullName,
        email: data.email ?? existingByPhone.email,
        country: data.country ?? existingByPhone.country,
        city: data.city ?? existingByPhone.city,
        gender: data.gender ?? existingByPhone.gender,
        ageRange: data.ageRange ?? existingByPhone.ageRange,
        metadata: data.metadata ?? existingByPhone.metadata,
        source: "API",
        consentStatus,
        optInAt:
          consentStatus === "ACCEPTED"
            ? existingByPhone.optInAt || new Date()
            : existingByPhone.optInAt,
        tags: mergeTags(existingByPhone.tags, data.tags || []),
      },
    });

    return {
      action: "updated",
      contact,
    };
  }

  const contact = await prisma.contact.create({
    data: {
      companyId,
      externalId: data.externalId,
      fullName: data.fullName,
      phone,
      email: data.email,
      country: data.country,
      city: data.city,
      gender: data.gender,
      ageRange: data.ageRange,
      metadata: data.metadata,
      source: "API",
      consentStatus,
      optInAt: consentStatus === "ACCEPTED" ? new Date() : undefined,
      tags: data.tags || [],
    },
  });

  return {
    action: "created",
    contact,
  };
};

export const optInContactService = async (data: OptInContactInput) => {
  const company = await prisma.company.findUnique({
    where: {
      slug: data.companySlug,
    },
  });

  if (!company) {
    throw new AppError("Entreprise introuvable", 404);
  }

  if (company.status !== "ACTIVE") {
    throw new AppError("Cette entreprise n’est pas active", 403);
  }

  const phone = normalizePhone(data.phone);

  const existingContact = await prisma.contact.findUnique({
    where: {
      companyId_phone: {
        companyId: company.id,
        phone,
      },
    },
  });

  const consentText =
    data.consentText ||
    `Consentement donné via QR Code / WhatsApp opt-in pour ${company.name}`;

  if (existingContact) {
    const contact = await prisma.contact.update({
      where: { id: existingContact.id },
      data: {
        fullName: data.fullName ?? existingContact.fullName,
        email: data.email ?? existingContact.email,
        country: data.country ?? existingContact.country,
        city: data.city ?? existingContact.city,
        metadata: data.metadata ?? existingContact.metadata,
        source: "WHATSAPP_OPT_IN",
        consentStatus: "ACCEPTED",
        optInAt: existingContact.optInAt || new Date(),
        consentText,
        tags: mergeTags(existingContact.tags, data.tags || ["opt-in"]),
      },
    });

    return {
      action: "updated",
      contact,
    };
  }

  const contact = await prisma.contact.create({
    data: {
      companyId: company.id,
      fullName: data.fullName,
      phone,
      email: data.email,
      country: data.country,
      city: data.city,
      metadata: data.metadata,
      source: "WHATSAPP_OPT_IN",
      consentStatus: "ACCEPTED",
      optInAt: new Date(),
      consentText,
      tags: data.tags || ["opt-in"],
    },
  });

  return {
    action: "created",
    contact,
  };
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

  const phone = data.phone ? normalizePhone(data.phone) : undefined;

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

  if (data.externalId && data.externalId !== contact.externalId) {
    const existingExternal = await prisma.contact.findUnique({
      where: {
        companyId_externalId: {
          companyId,
          externalId: data.externalId,
        },
      },
    });

    if (existingExternal) {
      throw new AppError("Un autre contact utilise déjà cet identifiant externe", 409);
    }
  }

  return prisma.contact.update({
    where: {
      id: contactId,
    },
    data: {
      ...data,
      ...(phone ? { phone } : {}),
      optInAt:
        data.consentStatus === "ACCEPTED" && !contact.optInAt
          ? new Date()
          : contact.optInAt,
    },
  });
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