"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optInContactSchema = exports.syncContactSchema = exports.importContactsSchema = exports.updateContactSchema = exports.createContactSchema = void 0;
const zod_1 = require("zod");
exports.createContactSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2, "Le nom doit contenir au moins 2 caractères").optional(),
    phone: zod_1.z.string().min(6, "Le numéro de téléphone est obligatoire"),
    email: zod_1.z.string().email("Email invalide").optional(),
    country: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    gender: zod_1.z.string().optional(),
    ageRange: zod_1.z.string().optional(),
    externalId: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    source: zod_1.z.enum(["MANUAL", "IMPORT", "API", "WHATSAPP_OPT_IN"]).optional(),
    consentStatus: zod_1.z.enum(["PENDING", "ACCEPTED", "REJECTED"]).optional(),
    consentText: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.updateContactSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2).optional(),
    phone: zod_1.z.string().min(6).optional(),
    email: zod_1.z.string().email("Email invalide").optional(),
    country: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    gender: zod_1.z.string().optional(),
    ageRange: zod_1.z.string().optional(),
    externalId: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    source: zod_1.z.enum(["MANUAL", "IMPORT", "API", "WHATSAPP_OPT_IN"]).optional(),
    consentStatus: zod_1.z.enum(["PENDING", "ACCEPTED", "REJECTED"]).optional(),
    consentText: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.importContactsSchema = zod_1.z.object({
    contacts: zod_1.z.array(exports.createContactSchema).min(1, "La liste de contacts est vide"),
    consentStatus: zod_1.z.enum(["PENDING", "ACCEPTED", "REJECTED"]).optional(),
    defaultTags: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.syncContactSchema = zod_1.z.object({
    externalId: zod_1.z.string().min(1, "L'identifiant externe est obligatoire"),
    fullName: zod_1.z.string().optional(),
    phone: zod_1.z.string().min(6, "Le numéro de téléphone est obligatoire"),
    email: zod_1.z.string().email("Email invalide").optional(),
    country: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    gender: zod_1.z.string().optional(),
    ageRange: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    consentStatus: zod_1.z.enum(["PENDING", "ACCEPTED", "REJECTED"]).optional(),
});
exports.optInContactSchema = zod_1.z.object({
    companySlug: zod_1.z.string().min(2, "Entreprise invalide"),
    fullName: zod_1.z.string().min(2).optional(),
    phone: zod_1.z.string().min(6, "Le numéro de téléphone est obligatoire"),
    email: zod_1.z.string().email("Email invalide").optional(),
    country: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    consentText: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
});
