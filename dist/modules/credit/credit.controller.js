"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminGetAllCreditTransactionsController = exports.adjustCreditsController = exports.addCreditsController = exports.adminGetCompanyCreditTransactionsController = exports.getMyCreditTransactionsController = exports.getMyCreditBalanceController = void 0;
const credit_service_1 = require("./credit.service");
const credit_validation_1 = require("./credit.validation");
const getMyCreditBalanceController = async (req, res, next) => {
    try {
        const balance = await (0, credit_service_1.getMyCreditBalanceService)(req.user.companyId);
        res.status(200).json({
            message: "Solde de crédits récupéré avec succès",
            data: balance,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMyCreditBalanceController = getMyCreditBalanceController;
const getMyCreditTransactionsController = async (req, res, next) => {
    try {
        const transactions = await (0, credit_service_1.getMyCreditTransactionsService)(req.user.companyId, req.query);
        res.status(200).json({
            message: "Historique des crédits récupéré avec succès",
            ...transactions,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMyCreditTransactionsController = getMyCreditTransactionsController;
const adminGetCompanyCreditTransactionsController = async (req, res, next) => {
    try {
        const transactions = await (0, credit_service_1.adminGetCompanyCreditTransactionsService)(String(req.params.companyId), req.query);
        res.status(200).json({
            message: "Historique des crédits de l’entreprise récupéré avec succès",
            ...transactions,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.adminGetCompanyCreditTransactionsController = adminGetCompanyCreditTransactionsController;
const addCreditsController = async (req, res, next) => {
    try {
        const data = credit_validation_1.addCreditsSchema.parse(req.body);
        const result = await (0, credit_service_1.addCreditsService)(req.user.userId, data);
        res.status(201).json({
            message: "Crédits ajoutés avec succès",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.addCreditsController = addCreditsController;
const adjustCreditsController = async (req, res, next) => {
    try {
        const data = credit_validation_1.adjustCreditsSchema.parse(req.body);
        const result = await (0, credit_service_1.adjustCreditsService)(req.user.userId, data);
        res.status(200).json({
            message: "Crédits ajustés avec succès",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.adjustCreditsController = adjustCreditsController;
const adminGetAllCreditTransactionsController = async (req, res, next) => {
    try {
        const transactions = await (0, credit_service_1.adminGetAllCreditTransactionsService)(req.query);
        res.status(200).json({
            message: "Historique global des crédits récupéré avec succès",
            ...transactions,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.adminGetAllCreditTransactionsController = adminGetAllCreditTransactionsController;
