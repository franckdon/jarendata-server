"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCompanyMemberStatusSchema = exports.updateCompanyMemberRoleSchema = exports.createCompanyMemberSchema = exports.updateCompanyStatusSchema = exports.updateCompanySchema = exports.createCompanySchema = void 0;
const zod_1 = require("zod");
const optionalString = zod_1.z
    .string()
    .trim()
    .optional()
    .transform((value) => (value === "" ? undefined : value));
const optionalEmail = zod_1.z
    .string()
    .trim()
    .optional()
    .transform((value) => (value === "" ? undefined : value))
    .pipe(zod_1.z.string().email().optional());
const optionalUrl = zod_1.z
    .string()
    .trim()
    .optional()
    .transform((value) => {
    if (!value || value === "")
        return undefined;
    if (!value.startsWith("http://") && !value.startsWith("https://")) {
        return `https://${value}`;
    }
    return value;
})
    .pipe(zod_1.z.string().url().optional());
exports.createCompanySchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2, "Le nom est obligatoire"),
    email: optionalEmail,
    phone: optionalString,
    website: optionalUrl,
    country: zod_1.z.string().trim().min(2, "Le pays est obligatoire"),
    city: optionalString,
    address: optionalString,
    industry: optionalString,
    size: zod_1.z
        .enum(["SOLO", "SMALL", "MEDIUM", "LARGE", "ENTERPRISE"])
        .default("SMALL"),
    status: zod_1.z
        .enum(["PENDING", "ACTIVE", "SUSPENDED", "DISABLED"])
        .default("PENDING"),
});
exports.updateCompanySchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2).optional(),
    email: optionalEmail,
    phone: optionalString,
    website: optionalUrl,
    country: zod_1.z.string().trim().min(2).optional(),
    city: optionalString,
    address: optionalString,
    industry: optionalString,
    size: zod_1.z.enum(["SOLO", "SMALL", "MEDIUM", "LARGE", "ENTERPRISE"]).optional(),
    status: zod_1.z.enum(["PENDING", "ACTIVE", "SUSPENDED", "DISABLED"]).optional(),
});
exports.updateCompanyStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["PENDING", "ACTIVE", "SUSPENDED", "DISABLED"]),
});
exports.createCompanyMemberSchema = zod_1.z.object({
    fullName: zod_1.z.string().trim().min(2, "Le nom complet est obligatoire"),
    email: zod_1.z.string().trim().email("Email invalide"),
    password: zod_1.z
        .string()
        .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    companyRole: zod_1.z.enum(["MANAGER", "ANALYST", "MEMBER"]),
});
exports.updateCompanyMemberRoleSchema = zod_1.z.object({
    companyRole: zod_1.z.enum(["MANAGER", "ANALYST", "MEMBER"]),
});
exports.updateCompanyMemberStatusSchema = zod_1.z.object({
    isActive: zod_1.z.boolean(),
});
