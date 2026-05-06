"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adjustCreditsSchema = exports.addCreditsSchema = void 0;
const zod_1 = require("zod");
exports.addCreditsSchema = zod_1.z.object({
    companyId: zod_1.z.string().uuid("Entreprise invalide"),
    amount: zod_1.z.number().int().positive("Le montant doit être positif"),
    description: zod_1.z.string().optional(),
});
exports.adjustCreditsSchema = zod_1.z.object({
    companyId: zod_1.z.string().uuid("Entreprise invalide"),
    amount: zod_1.z.number().int(),
    description: zod_1.z.string().optional(),
});
