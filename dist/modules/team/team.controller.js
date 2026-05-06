"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTeamMemberController = exports.updateTeamMemberStatusController = exports.updateTeamMemberRoleController = exports.createTeamMemberController = exports.getTeamController = void 0;
const team_service_1 = require("./team.service");
const team_validation_1 = require("./team.validation");
const getTeamController = async (req, res, next) => {
    try {
        const members = await (0, team_service_1.getTeamService)(req.user.companyId);
        res.status(200).json({
            message: "Équipe récupérée avec succès",
            data: members,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTeamController = getTeamController;
const createTeamMemberController = async (req, res, next) => {
    try {
        const data = team_validation_1.createTeamMemberSchema.parse(req.body);
        const member = await (0, team_service_1.createTeamMemberService)(req.user.companyId, data);
        res.status(201).json({
            message: "Membre ajouté avec succès",
            data: member,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createTeamMemberController = createTeamMemberController;
const updateTeamMemberRoleController = async (req, res, next) => {
    try {
        const data = team_validation_1.updateTeamMemberRoleSchema.parse(req.body);
        const member = await (0, team_service_1.updateTeamMemberRoleService)(req.user.companyId, String(req.params.userId), data);
        res.status(200).json({
            message: "Rôle du membre mis à jour avec succès",
            data: member,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateTeamMemberRoleController = updateTeamMemberRoleController;
const updateTeamMemberStatusController = async (req, res, next) => {
    try {
        const data = team_validation_1.updateTeamMemberStatusSchema.parse(req.body);
        const member = await (0, team_service_1.updateTeamMemberStatusService)(req.user.companyId, String(req.params.userId), data);
        res.status(200).json({
            message: "Statut du membre mis à jour avec succès",
            data: member,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateTeamMemberStatusController = updateTeamMemberStatusController;
const deleteTeamMemberController = async (req, res, next) => {
    try {
        await (0, team_service_1.deleteTeamMemberService)(req.user.companyId, String(req.params.userId));
        res.status(200).json({
            message: "Membre supprimé avec succès",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteTeamMemberController = deleteTeamMemberController;
