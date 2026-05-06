"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applySurveyTemplateController = exports.reorderQuestionsController = exports.updateOptionNextQuestionController = exports.replaceQuestionOptionsController = exports.deleteSurveyQuestionController = exports.updateSurveyQuestionController = exports.createSurveyQuestionController = exports.getSurveyFlowController = void 0;
const survey_service_1 = require("./survey.service");
const survey_validation_1 = require("./survey.validation");
const getSurveyFlowController = async (req, res, next) => {
    try {
        const questions = await (0, survey_service_1.getSurveyFlowService)(req.user.companyId, String(req.params.campaignId));
        res.status(200).json({
            message: "Questionnaire récupéré avec succès",
            data: questions,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getSurveyFlowController = getSurveyFlowController;
const createSurveyQuestionController = async (req, res, next) => {
    try {
        const data = survey_validation_1.createSurveyQuestionSchema.parse(req.body);
        const question = await (0, survey_service_1.createSurveyQuestionService)(req.user.companyId, String(req.params.campaignId), data);
        res.status(201).json({
            message: "Question créée avec succès",
            data: question,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createSurveyQuestionController = createSurveyQuestionController;
const updateSurveyQuestionController = async (req, res, next) => {
    try {
        const data = survey_validation_1.updateSurveyQuestionSchema.parse(req.body);
        const question = await (0, survey_service_1.updateSurveyQuestionService)(req.user.companyId, String(req.params.campaignId), String(req.params.questionId), data);
        res.status(200).json({
            message: "Question mise à jour avec succès",
            data: question,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateSurveyQuestionController = updateSurveyQuestionController;
const deleteSurveyQuestionController = async (req, res, next) => {
    try {
        await (0, survey_service_1.deleteSurveyQuestionService)(req.user.companyId, String(req.params.campaignId), String(req.params.questionId));
        res.status(200).json({
            message: "Question supprimée avec succès",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteSurveyQuestionController = deleteSurveyQuestionController;
const replaceQuestionOptionsController = async (req, res, next) => {
    try {
        const data = survey_validation_1.createSurveyQuestionSchema.pick({ options: true }).parse(req.body);
        const question = await (0, survey_service_1.replaceQuestionOptionsService)(req.user.companyId, String(req.params.campaignId), String(req.params.questionId), data.options);
        res.status(200).json({
            message: "Options remplacées avec succès",
            data: question,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.replaceQuestionOptionsController = replaceQuestionOptionsController;
const updateOptionNextQuestionController = async (req, res, next) => {
    try {
        const data = survey_validation_1.updateOptionNextQuestionSchema.parse(req.body);
        const option = await (0, survey_service_1.updateOptionNextQuestionService)(req.user.companyId, String(req.params.campaignId), String(req.params.optionId), data);
        res.status(200).json({
            message: "Redirection de l’option mise à jour avec succès",
            data: option,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateOptionNextQuestionController = updateOptionNextQuestionController;
const reorderQuestionsController = async (req, res, next) => {
    try {
        const data = survey_validation_1.reorderQuestionsSchema.parse(req.body);
        const questions = await (0, survey_service_1.reorderQuestionsService)(req.user.companyId, String(req.params.campaignId), data);
        res.status(200).json({
            message: "Ordre des questions mis à jour avec succès",
            data: questions,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.reorderQuestionsController = reorderQuestionsController;
const applySurveyTemplateController = async (req, res, next) => {
    try {
        const data = survey_validation_1.applyTemplateSchema.parse(req.body);
        const questions = await (0, survey_service_1.applySurveyTemplateService)(req.user.companyId, String(req.params.campaignId), data);
        res.status(201).json({
            message: "Template appliqué avec succès",
            data: questions,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.applySurveyTemplateController = applySurveyTemplateController;
