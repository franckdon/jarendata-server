"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCampaignRecipientsController = exports.updateCampaignRecipientStatusController = exports.getCampaignRecipientStatsController = exports.getCampaignRecipientsController = exports.generateCampaignRecipientsController = exports.previewCampaignRecipientsController = void 0;
const dispatch_service_1 = require("./dispatch.service");
const dispatch_validation_1 = require("./dispatch.validation");
const previewCampaignRecipientsController = async (req, res, next) => {
    try {
        const preview = await (0, dispatch_service_1.previewCampaignRecipientsService)(req.user.companyId, String(req.params.campaignId));
        res.status(200).json({
            message: "Prévisualisation des destinataires récupérée avec succès",
            data: preview,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.previewCampaignRecipientsController = previewCampaignRecipientsController;
const generateCampaignRecipientsController = async (req, res, next) => {
    try {
        const result = await (0, dispatch_service_1.generateCampaignRecipientsService)(req.user.companyId, String(req.params.campaignId));
        res.status(201).json({
            message: "Destinataires générés avec succès",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.generateCampaignRecipientsController = generateCampaignRecipientsController;
const getCampaignRecipientsController = async (req, res, next) => {
    try {
        const recipients = await (0, dispatch_service_1.getCampaignRecipientsService)(req.user.companyId, String(req.params.campaignId), req.query);
        res.status(200).json({
            message: "Destinataires récupérés avec succès",
            ...recipients,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCampaignRecipientsController = getCampaignRecipientsController;
const getCampaignRecipientStatsController = async (req, res, next) => {
    try {
        const stats = await (0, dispatch_service_1.getCampaignRecipientStatsService)(req.user.companyId, String(req.params.campaignId));
        res.status(200).json({
            message: "Statistiques des destinataires récupérées avec succès",
            data: stats,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCampaignRecipientStatsController = getCampaignRecipientStatsController;
const updateCampaignRecipientStatusController = async (req, res, next) => {
    try {
        const data = dispatch_validation_1.updateRecipientStatusSchema.parse(req.body);
        const recipient = await (0, dispatch_service_1.updateCampaignRecipientStatusService)(req.user.companyId, String(req.params.campaignId), String(req.params.recipientId), data);
        res.status(200).json({
            message: "Statut du destinataire mis à jour avec succès",
            data: recipient,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateCampaignRecipientStatusController = updateCampaignRecipientStatusController;
const clearCampaignRecipientsController = async (req, res, next) => {
    try {
        await (0, dispatch_service_1.clearCampaignRecipientsService)(req.user.companyId, String(req.params.campaignId));
        res.status(200).json({
            message: "Destinataires en attente supprimés avec succès",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.clearCampaignRecipientsController = clearCampaignRecipientsController;
