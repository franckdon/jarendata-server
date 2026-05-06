"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRecipientStatusSchema = void 0;
const zod_1 = require("zod");
exports.updateRecipientStatusSchema = zod_1.z.object({
    status: zod_1.z.enum([
        "PENDING",
        "SENT",
        "DELIVERED",
        "READ",
        "RESPONDED",
        "FAILED",
        "CANCELLED",
    ]),
    errorMessage: zod_1.z.string().optional(),
});
