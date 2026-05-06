"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCampaignAnalyticsController = exports.getCampaignSessionsController = exports.getCampaignAnswersController = exports.completeSurveySessionController = exports.submitAnswerController = exports.startSurveySessionController = void 0;
const response_service_1 = require("./response.service");
const response_validation_1 = require("./response.validation");
const startSurveySessionController = async (req, res, next) => {
    try {
        const data = response_validation_1.startSurveySessionSchema.parse(req.body);
        const session = await (0, response_service_1.startSurveySessionService)(req.user.companyId, data);
        res.status(201).json({
            message: "Session de réponse démarrée avec succès",
            data: session,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.startSurveySessionController = startSurveySessionController;
const submitAnswerController = async (req, res, next) => {
    try {
        const data = response_validation_1.submitAnswerSchema.parse(req.body);
        const answer = await (0, response_service_1.submitAnswerService)(req.user.companyId, data);
        res.status(201).json({
            message: "Réponse enregistrée avec succès",
            data: answer,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.submitAnswerController = submitAnswerController;
const completeSurveySessionController = async (req, res, next) => {
    try {
        const data = response_validation_1.completeSurveySessionSchema.parse(req.body);
        const session = await (0, response_service_1.completeSurveySessionService)(req.user.companyId, data);
        res.status(200).json({
            message: "Session terminée avec succès",
            data: session,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.completeSurveySessionController = completeSurveySessionController;
const getCampaignAnswersController = async (req, res, next) => {
    try {
        const answers = await (0, response_service_1.getCampaignAnswersService)(req.user.companyId, String(req.params.campaignId), req.query);
        res.status(200).json({
            message: "Réponses récupérées avec succès",
            ...answers,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCampaignAnswersController = getCampaignAnswersController;
const getCampaignSessionsController = async (req, res, next) => {
    try {
        const sessions = await (0, response_service_1.getCampaignSessionsService)(req.user.companyId, String(req.params.campaignId), req.query);
        res.status(200).json({
            message: "Sessions récupérées avec succès",
            ...sessions,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCampaignSessionsController = getCampaignSessionsController;
const getCampaignAnalyticsController = async (req, res, next) => {
    try {
        const analytics = await (0, response_service_1.getCampaignAnalyticsService)(req.user.companyId, String(req.params.campaignId));
        res.status(200).json({
            message: "Analytics récupérées avec succès",
            data: analytics,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCampaignAnalyticsController = getCampaignAnalyticsController;
