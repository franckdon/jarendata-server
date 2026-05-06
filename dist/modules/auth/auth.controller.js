"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMeController = exports.meController = exports.loginController = exports.registerController = void 0;
const auth_validation_1 = require("./auth.validation");
const auth_service_1 = require("./auth.service");
const registerController = async (req, res, next) => {
    try {
        const data = auth_validation_1.registerSchema.parse(req.body);
        const result = await (0, auth_service_1.registerService)(data);
        res.status(201).json({
            message: "Compte créé avec succès",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.registerController = registerController;
const loginController = async (req, res, next) => {
    try {
        const data = auth_validation_1.loginSchema.parse(req.body);
        const result = await (0, auth_service_1.loginService)(data);
        res.status(200).json({
            message: "Connexion réussie",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.loginController = loginController;
const meController = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const user = await (0, auth_service_1.getMeService)(userId);
        res.status(200).json({
            message: "Utilisateur connecté",
            data: user,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.meController = meController;
const updateMeController = async (req, res, next) => {
    try {
        const data = auth_validation_1.updateMeSchema.parse(req.body);
        const user = await (0, auth_service_1.updateMeService)(req.user.userId, data);
        res.status(200).json({
            message: "Profil mis à jour avec succès",
            data: user,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateMeController = updateMeController;
