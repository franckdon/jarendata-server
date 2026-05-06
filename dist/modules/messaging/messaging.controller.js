"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.receiveWhatsAppWebhookController = exports.verifyWhatsAppWebhookController = exports.sendCampaignMessagesController = exports.getMessageLogsController = exports.upsertPlatformMessagingAccountController = exports.getPlatformMessagingAccountController = exports.upsertMyMessagingAccountController = exports.getMyMessagingAccountController = void 0;
const env_1 = require("../../config/env");
const conversation_engine_1 = require("./conversation.engine");
const messaging_service_1 = require("./messaging.service");
const messaging_validation_1 = require("./messaging.validation");
const getMyMessagingAccountController = async (req, res, next) => {
    try {
        const account = await (0, messaging_service_1.getMyMessagingAccountService)(req.user.companyId);
        res.status(200).json({
            message: "Compte messaging entreprise récupéré avec succès",
            data: account,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMyMessagingAccountController = getMyMessagingAccountController;
const upsertMyMessagingAccountController = async (req, res, next) => {
    try {
        const data = messaging_validation_1.upsertCompanyMessagingAccountSchema.parse(req.body);
        const account = await (0, messaging_service_1.upsertMyMessagingAccountService)(req.user.companyId, data);
        res.status(200).json({
            message: "Compte messaging entreprise enregistré avec succès",
            data: account,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.upsertMyMessagingAccountController = upsertMyMessagingAccountController;
const getPlatformMessagingAccountController = async (_req, res, next) => {
    try {
        const account = await (0, messaging_service_1.getPlatformMessagingAccountService)();
        res.status(200).json({
            message: "Compte messaging Jarendata récupéré avec succès",
            data: account,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPlatformMessagingAccountController = getPlatformMessagingAccountController;
const upsertPlatformMessagingAccountController = async (req, res, next) => {
    try {
        const data = messaging_validation_1.upsertPlatformMessagingAccountSchema.parse(req.body);
        const account = await (0, messaging_service_1.upsertPlatformMessagingAccountService)(data);
        res.status(200).json({
            message: "Compte messaging Jarendata enregistré avec succès",
            data: account,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.upsertPlatformMessagingAccountController = upsertPlatformMessagingAccountController;
const getMessageLogsController = async (req, res, next) => {
    try {
        const logs = await (0, messaging_service_1.getMessageLogsService)(req.user.companyId, req.query);
        res.status(200).json({
            message: "Logs de messages récupérés avec succès",
            ...logs,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMessageLogsController = getMessageLogsController;
const sendCampaignMessagesController = async (req, res, next) => {
    try {
        const data = messaging_validation_1.sendCampaignMessagesSchema.parse(req.body);
        const result = await (0, messaging_service_1.sendCampaignMessagesService)(req.user.companyId, String(req.params.campaignId), data);
        res.status(200).json({
            message: "Traitement d’envoi terminé",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.sendCampaignMessagesController = sendCampaignMessagesController;
const verifyWhatsAppWebhookController = (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (mode === "subscribe" && token === env_1.env.globalWhatsappVerifyToken) {
        return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
};
exports.verifyWhatsAppWebhookController = verifyWhatsAppWebhookController;
const receiveWhatsAppWebhookController = async (req, res) => {
    try {
        const payload = req.body;
        const entry = payload?.entry?.[0];
        const change = entry?.changes?.[0];
        const value = change?.value;
        const message = value?.messages?.[0];
        if (!message) {
            return res.sendStatus(200);
        }
        const fromPhone = message.from;
        const body = message?.text?.body ||
            message?.button?.text ||
            message?.interactive?.button_reply?.title ||
            message?.interactive?.list_reply?.title ||
            "";
        if (!fromPhone || !body) {
            return res.sendStatus(200);
        }
        await (0, conversation_engine_1.handleIncomingWhatsAppMessage)({
            fromPhone,
            body,
            payload,
        });
        return res.sendStatus(200);
    }
    catch (error) {
        console.error("WhatsApp webhook error:", error);
        return res.sendStatus(200);
    }
};
exports.receiveWhatsAppWebhookController = receiveWhatsAppWebhookController;
