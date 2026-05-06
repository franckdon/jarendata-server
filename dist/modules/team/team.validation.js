"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTeamMemberStatusSchema = exports.updateTeamMemberRoleSchema = exports.createTeamMemberSchema = void 0;
const zod_1 = require("zod");
exports.createTeamMemberSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2, "Le nom complet est obligatoire"),
    email: zod_1.z.string().email("Email invalide"),
    password: zod_1.z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    companyRole: zod_1.z.enum(["MANAGER", "ANALYST", "MEMBER"]),
});
exports.updateTeamMemberRoleSchema = zod_1.z.object({
    companyRole: zod_1.z.enum(["MANAGER", "ANALYST", "MEMBER"]),
});
exports.updateTeamMemberStatusSchema = zod_1.z.object({
    isActive: zod_1.z.boolean(),
});
