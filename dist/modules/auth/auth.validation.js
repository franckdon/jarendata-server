"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.updateMeSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2, "Le nom complet est obligatoire"),
    email: zod_1.z.string().email("Email invalide"),
    password: zod_1.z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    companyName: zod_1.z.string().min(2, "Le nom de l'entreprise est obligatoire"),
    companyCountry: zod_1.z.string().min(2, "Le pays est obligatoire"),
    companyCity: zod_1.z.string().optional(),
    companyPhone: zod_1.z.string().optional(),
    companyIndustry: zod_1.z.string().optional(),
});
exports.updateMeSchema = zod_1.z
    .object({
    fullName: zod_1.z.string().min(2, "Le nom complet est obligatoire").optional(),
    email: zod_1.z.string().email("Email invalide").optional(),
    currentPassword: zod_1.z.string().optional(),
    newPassword: zod_1.z
        .string()
        .min(6, "Le nouveau mot de passe doit contenir au moins 6 caractères")
        .optional(),
    confirmPassword: zod_1.z.string().optional(),
})
    .refine((data) => {
    if (!data.newPassword && !data.confirmPassword)
        return true;
    return data.newPassword === data.confirmPassword;
}, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
})
    .refine((data) => {
    if (!data.newPassword)
        return true;
    return !!data.currentPassword;
}, {
    message: "Le mot de passe actuel est obligatoire",
    path: ["currentPassword"],
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Email invalide"),
    password: zod_1.z.string().min(1, "Le mot de passe est obligatoire"),
});
