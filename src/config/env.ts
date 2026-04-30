import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || "4000",
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET || "default_secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  whatsappGraphApiVersion: process.env.WHATSAPP_GRAPH_API_VERSION || "v20.0",
  globalWhatsappVerifyToken: process.env.GLOBAL_WHATSAPP_VERIFY_TOKEN || "jarendata_webhook_verify_token",
};