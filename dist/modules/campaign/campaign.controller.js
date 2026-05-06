"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCampaignStatusController = exports.deleteCampaignController = exports.updateCampaignController = exports.getCampaignByIdController = exports.createCampaignController = exports.getCampaignsController = void 0;
const campaign_service_1 = require("./campaign.service");
const campaign_validation_1 = require("./campaign.validation");
const getCampaignsController = async (req, res, next) => {
    try {
        const campaigns = await (0, campaign_service_1.getCampaignsService)(req.user.companyId, req.query);
        res.status(200).json({
            message: "Campagnes récupérées avec succès",
            ...campaigns,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCampaignsController = getCampaignsController;
const createCampaignController = async (req, res, next) => {
    try {
        const data = campaign_validation_1.createCampaignSchema.parse(req.body);
        const campaign = await (0, campaign_service_1.createCampaignService)(req.user.companyId, req.user.userId, data);
        res.status(201).json({
            message: "Campagne créée avec succès",
            data: campaign,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createCampaignController = createCampaignController;
const getCampaignByIdController = async (req, res, next) => {
    try {
        const campaign = await (0, campaign_service_1.getCampaignByIdService)(req.user.companyId, String(req.params.id));
        res.status(200).json({
            message: "Campagne récupérée avec succès",
            data: campaign,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCampaignByIdController = getCampaignByIdController;
const updateCampaignController = async (req, res, next) => {
    try {
        const data = campaign_validation_1.updateCampaignSchema.parse(req.body);
        const campaign = await (0, campaign_service_1.updateCampaignService)(req.user.companyId, String(req.params.id), data);
        res.status(200).json({
            message: "Campagne mise à jour avec succès",
            data: campaign,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateCampaignController = updateCampaignController;
const deleteCampaignController = async (req, res, next) => {
    try {
        await (0, campaign_service_1.deleteCampaignService)(req.user.companyId, String(req.params.id));
        res.status(200).json({
            message: "Campagne supprimée avec succès",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCampaignController = deleteCampaignController;
const updateCampaignStatusController = async (req, res, next) => {
    try {
        const data = campaign_validation_1.updateCampaignStatusSchema.parse(req.body);
        const campaign = await (0, campaign_service_1.updateCampaignStatusService)(req.user.companyId, req.user.userId, String(req.params.id), data);
        res.status(200).json({
            message: "Statut de la campagne mis à jour avec succès",
            data: campaign,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateCampaignStatusController = updateCampaignStatusController;
