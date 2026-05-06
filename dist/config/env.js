"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.env = {
    port: process.env.PORT || "4000",
    nodeEnv: process.env.NODE_ENV || "development",
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
    jwtSecret: process.env.JWT_SECRET || "default_secret",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
    whatsappGraphApiVersion: process.env.WHATSAPP_GRAPH_API_VERSION || "v20.0",
    globalWhatsappVerifyToken: process.env.GLOBAL_WHATSAPP_VERIFY_TOKEN || "jarendata_webhook_verify_token",
};
