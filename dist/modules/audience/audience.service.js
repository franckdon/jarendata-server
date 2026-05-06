"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteContactService = exports.updateContactService = exports.getContactByIdService = exports.optInContactService = exports.syncContactFromApiService = exports.importContactsService = exports.createContactService = exports.getContactsService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../../config/prisma");
const appError_1 = require("../../utils/appError");
const pagination_1 = require("../../utils/pagination");
const toPrismaJson = (value) => {
    if (value === undefined)
        return undefined;
    if (value === null)
        return client_1.Prisma.JsonNull;
    return value;
};
const normalizePhone = (phone) => {
    return phone.replace(/\s+/g, "").trim();
};
const mergeTags = (tagsA = [], tagsB = []) => {
    return Array.from(new Set([...tagsA, ...tagsB].filter(Boolean)));
};
const getContactsService = async (companyId, query) => {
    if (!companyId) {
        throw new appError_1.AppError("Entreprise introuvable", 404);
    }
    const search = query.search?.trim();
    const where = {
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
    return (0, pagination_1.paginate)({
        model: prisma_1.prisma.contact,
        page: query.page,
        limit: query.limit,
        where,
        orderBy: { createdAt: "desc" },
    });
};
exports.getContactsService = getContactsService;
const createContactService = async (companyId, data) => {
    if (!companyId) {
        throw new appError_1.AppError("Entreprise introuvable", 404);
    }
    const phone = normalizePhone(data.phone);
    const existingContact = await prisma_1.prisma.contact.findUnique({
        where: {
            companyId_phone: {
                companyId,
                phone,
            },
        },
    });
    if (existingContact) {
        throw new appError_1.AppError("Ce contact existe déjà dans votre audience", 409);
    }
    if (data.externalId) {
        const existingExternal = await prisma_1.prisma.contact.findUnique({
            where: {
                companyId_externalId: {
                    companyId,
                    externalId: data.externalId,
                },
            },
        });
        if (existingExternal) {
            throw new appError_1.AppError("Un contact avec cet identifiant externe existe déjà", 409);
        }
    }
    const consentStatus = data.consentStatus || "PENDING";
    return prisma_1.prisma.contact.create({
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
            metadata: toPrismaJson(data.metadata),
            source: data.source || "MANUAL",
            consentStatus,
            optInAt: consentStatus === "ACCEPTED" ? new Date() : undefined,
            consentText: data.consentText,
            tags: data.tags || [],
        },
    });
};
exports.createContactService = createContactService;
const importContactsService = async (companyId, data) => {
    if (!companyId) {
        throw new appError_1.AppError("Entreprise introuvable", 404);
    }
    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors = [];
    for (const item of data.contacts) {
        try {
            const phone = normalizePhone(item.phone);
            const existingContact = await prisma_1.prisma.contact.findUnique({
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
                await prisma_1.prisma.contact.update({
                    where: { id: existingContact.id },
                    data: {
                        fullName: item.fullName ?? existingContact.fullName,
                        email: item.email ?? existingContact.email,
                        country: item.country ?? existingContact.country,
                        city: item.city ?? existingContact.city,
                        gender: item.gender ?? existingContact.gender,
                        ageRange: item.ageRange ?? existingContact.ageRange,
                        externalId: item.externalId ?? existingContact.externalId,
                        metadata: toPrismaJson(item.metadata ?? existingContact.metadata),
                        source: "IMPORT",
                        consentStatus,
                        optInAt: consentStatus === "ACCEPTED"
                            ? existingContact.optInAt || new Date()
                            : existingContact.optInAt,
                        consentText: item.consentText ?? existingContact.consentText,
                        tags: mergeTags(existingContact.tags, finalTags),
                    },
                });
                updated += 1;
            }
            else {
                await prisma_1.prisma.contact.create({
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
                        metadata: toPrismaJson(item.metadata),
                        source: "IMPORT",
                        consentStatus,
                        optInAt: consentStatus === "ACCEPTED" ? new Date() : undefined,
                        consentText: item.consentText,
                        tags: finalTags,
                    },
                });
                created += 1;
            }
        }
        catch (error) {
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
exports.importContactsService = importContactsService;
const syncContactFromApiService = async (companyId, data) => {
    if (!companyId) {
        throw new appError_1.AppError("Entreprise introuvable", 404);
    }
    const phone = normalizePhone(data.phone);
    const consentStatus = data.consentStatus || "PENDING";
    const existingByExternalId = await prisma_1.prisma.contact.findUnique({
        where: {
            companyId_externalId: {
                companyId,
                externalId: data.externalId,
            },
        },
    });
    if (existingByExternalId) {
        const contact = await prisma_1.prisma.contact.update({
            where: { id: existingByExternalId.id },
            data: {
                fullName: data.fullName ?? existingByExternalId.fullName,
                phone,
                email: data.email ?? existingByExternalId.email,
                country: data.country ?? existingByExternalId.country,
                city: data.city ?? existingByExternalId.city,
                gender: data.gender ?? existingByExternalId.gender,
                ageRange: data.ageRange ?? existingByExternalId.ageRange,
                metadata: toPrismaJson(data.metadata ?? existingByExternalId.metadata),
                source: "API",
                consentStatus,
                optInAt: consentStatus === "ACCEPTED"
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
    const existingByPhone = await prisma_1.prisma.contact.findUnique({
        where: {
            companyId_phone: {
                companyId,
                phone,
            },
        },
    });
    if (existingByPhone) {
        const contact = await prisma_1.prisma.contact.update({
            where: { id: existingByPhone.id },
            data: {
                externalId: data.externalId,
                fullName: data.fullName ?? existingByPhone.fullName,
                email: data.email ?? existingByPhone.email,
                country: data.country ?? existingByPhone.country,
                city: data.city ?? existingByPhone.city,
                gender: data.gender ?? existingByPhone.gender,
                ageRange: data.ageRange ?? existingByPhone.ageRange,
                metadata: toPrismaJson(data.metadata ?? existingByPhone.metadata),
                source: "API",
                consentStatus,
                optInAt: consentStatus === "ACCEPTED"
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
    const contact = await prisma_1.prisma.contact.create({
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
            metadata: toPrismaJson(data.metadata),
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
exports.syncContactFromApiService = syncContactFromApiService;
const optInContactService = async (data) => {
    const company = await prisma_1.prisma.company.findUnique({
        where: {
            slug: data.companySlug,
        },
    });
    if (!company) {
        throw new appError_1.AppError("Entreprise introuvable", 404);
    }
    if (company.status !== "ACTIVE") {
        throw new appError_1.AppError("Cette entreprise n’est pas active", 403);
    }
    const phone = normalizePhone(data.phone);
    const existingContact = await prisma_1.prisma.contact.findUnique({
        where: {
            companyId_phone: {
                companyId: company.id,
                phone,
            },
        },
    });
    const consentText = data.consentText ||
        `Consentement donné via QR Code / WhatsApp opt-in pour ${company.name}`;
    if (existingContact) {
        const contact = await prisma_1.prisma.contact.update({
            where: { id: existingContact.id },
            data: {
                fullName: data.fullName ?? existingContact.fullName,
                email: data.email ?? existingContact.email,
                country: data.country ?? existingContact.country,
                city: data.city ?? existingContact.city,
                metadata: toPrismaJson(data.metadata ?? existingContact.metadata),
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
    const contact = await prisma_1.prisma.contact.create({
        data: {
            companyId: company.id,
            fullName: data.fullName,
            phone,
            email: data.email,
            country: data.country,
            city: data.city,
            metadata: toPrismaJson(data.metadata),
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
exports.optInContactService = optInContactService;
const getContactByIdService = async (companyId, contactId) => {
    if (!companyId) {
        throw new appError_1.AppError("Entreprise introuvable", 404);
    }
    const contact = await prisma_1.prisma.contact.findFirst({
        where: {
            id: contactId,
            companyId,
        },
    });
    if (!contact) {
        throw new appError_1.AppError("Contact introuvable", 404);
    }
    return contact;
};
exports.getContactByIdService = getContactByIdService;
const updateContactService = async (companyId, contactId, data) => {
    if (!companyId) {
        throw new appError_1.AppError("Entreprise introuvable", 404);
    }
    const contact = await prisma_1.prisma.contact.findFirst({
        where: {
            id: contactId,
            companyId,
        },
    });
    if (!contact) {
        throw new appError_1.AppError("Contact introuvable", 404);
    }
    const phone = data.phone ? normalizePhone(data.phone) : undefined;
    if (phone && phone !== contact.phone) {
        const existingContact = await prisma_1.prisma.contact.findUnique({
            where: {
                companyId_phone: {
                    companyId,
                    phone,
                },
            },
        });
        if (existingContact) {
            throw new appError_1.AppError("Un autre contact utilise déjà ce numéro", 409);
        }
    }
    if (data.externalId && data.externalId !== contact.externalId) {
        const existingExternal = await prisma_1.prisma.contact.findUnique({
            where: {
                companyId_externalId: {
                    companyId,
                    externalId: data.externalId,
                },
            },
        });
        if (existingExternal) {
            throw new appError_1.AppError("Un autre contact utilise déjà cet identifiant externe", 409);
        }
    }
    return prisma_1.prisma.contact.update({
        where: {
            id: contactId,
        },
        data: {
            fullName: data.fullName,
            phone: phone ?? undefined,
            email: data.email,
            country: data.country,
            city: data.city,
            gender: data.gender,
            ageRange: data.ageRange,
            externalId: data.externalId,
            metadata: toPrismaJson(data.metadata ?? contact.metadata),
            source: data.source,
            consentStatus: data.consentStatus,
            consentText: data.consentText,
            tags: data.tags,
            optInAt: data.consentStatus === "ACCEPTED" && !contact.optInAt
                ? new Date()
                : contact.optInAt,
        },
    });
};
exports.updateContactService = updateContactService;
const deleteContactService = async (companyId, contactId) => {
    if (!companyId) {
        throw new appError_1.AppError("Entreprise introuvable", 404);
    }
    const contact = await prisma_1.prisma.contact.findFirst({
        where: {
            id: contactId,
            companyId,
        },
    });
    if (!contact) {
        throw new appError_1.AppError("Contact introuvable", 404);
    }
    await prisma_1.prisma.contact.delete({
        where: {
            id: contactId,
        },
    });
    return true;
};
exports.deleteContactService = deleteContactService;
