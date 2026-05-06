"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCompanyMemberController = exports.updateCompanyMemberStatusController = exports.updateCompanyMemberRoleController = exports.createCompanyMemberController = exports.deleteCompanyController = exports.updateCompanyStatusController = exports.updateCompanyController = exports.getCompanyByIdController = exports.getCompaniesController = exports.updateMyCompanyController = exports.getMyCompanyController = exports.createCompanyController = void 0;
const company_service_1 = require("./company.service");
const company_validation_1 = require("./company.validation");
const getUploadedLogoUrl = (req) => {
    if (!req.file)
        return undefined;
    return `/uploads/companies/${req.file.filename}`;
};
const createCompanyController = async (req, res, next) => {
    try {
        const data = company_validation_1.createCompanySchema.parse(req.body);
        const logoUrl = getUploadedLogoUrl(req);
        const company = await (0, company_service_1.createCompanyService)(data, logoUrl);
        res.status(201).json({
            message: "Entreprise créée avec succès",
            data: company,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createCompanyController = createCompanyController;
const getMyCompanyController = async (req, res, next) => {
    try {
        const company = await (0, company_service_1.getMyCompanyService)(req.user.userId);
        res.status(200).json({
            message: "Entreprise récupérée avec succès",
            data: company,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMyCompanyController = getMyCompanyController;
const updateMyCompanyController = async (req, res, next) => {
    try {
        const data = company_validation_1.updateCompanySchema.parse(req.body);
        const logoUrl = getUploadedLogoUrl(req);
        const company = await (0, company_service_1.updateMyCompanyService)(req.user.userId, data, logoUrl);
        res.status(200).json({
            message: "Entreprise mise à jour avec succès",
            data: company,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateMyCompanyController = updateMyCompanyController;
const getCompaniesController = async (req, res, next) => {
    try {
        const companies = await (0, company_service_1.getCompaniesService)(req.query);
        res.status(200).json({
            message: "Liste des entreprises récupérée avec succès",
            ...companies,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCompaniesController = getCompaniesController;
const getCompanyByIdController = async (req, res, next) => {
    try {
        const company = await (0, company_service_1.getCompanyByIdService)(String(req.params.id));
        res.status(200).json({
            message: "Entreprise récupérée avec succès",
            data: company,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCompanyByIdController = getCompanyByIdController;
const updateCompanyController = async (req, res, next) => {
    try {
        const data = company_validation_1.updateCompanySchema.parse(req.body);
        const logoUrl = getUploadedLogoUrl(req);
        const company = await (0, company_service_1.updateCompanyService)(String(req.params.id), data, logoUrl);
        res.status(200).json({
            message: "Entreprise mise à jour avec succès",
            data: company,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateCompanyController = updateCompanyController;
const updateCompanyStatusController = async (req, res, next) => {
    try {
        const data = company_validation_1.updateCompanyStatusSchema.parse(req.body);
        const company = await (0, company_service_1.updateCompanyStatusService)(String(req.params.id), data);
        res.status(200).json({
            message: "Statut de l'entreprise mis à jour avec succès",
            data: company,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateCompanyStatusController = updateCompanyStatusController;
const deleteCompanyController = async (req, res, next) => {
    try {
        await (0, company_service_1.deleteCompanyService)(String(req.params.id));
        res.status(200).json({
            message: "Entreprise supprimée avec succès",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCompanyController = deleteCompanyController;
const createCompanyMemberController = async (req, res, next) => {
    try {
        const data = company_validation_1.createCompanyMemberSchema.parse(req.body);
        const member = await (0, company_service_1.createCompanyMemberService)(String(req.params.id), data);
        res.status(201).json({
            message: "Membre ajouté avec succès",
            data: member,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createCompanyMemberController = createCompanyMemberController;
const updateCompanyMemberRoleController = async (req, res, next) => {
    try {
        const data = company_validation_1.updateCompanyMemberRoleSchema.parse(req.body);
        const member = await (0, company_service_1.updateCompanyMemberRoleService)(String(req.params.id), String(req.params.userId), data);
        res.status(200).json({
            message: "Rôle du membre mis à jour avec succès",
            data: member,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateCompanyMemberRoleController = updateCompanyMemberRoleController;
const updateCompanyMemberStatusController = async (req, res, next) => {
    try {
        const data = company_validation_1.updateCompanyMemberStatusSchema.parse(req.body);
        const member = await (0, company_service_1.updateCompanyMemberStatusService)(String(req.params.id), String(req.params.userId), data);
        res.status(200).json({
            message: "Statut du membre mis à jour avec succès",
            data: member,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateCompanyMemberStatusController = updateCompanyMemberStatusController;
const deleteCompanyMemberController = async (req, res, next) => {
    try {
        await (0, company_service_1.deleteCompanyMemberService)(String(req.params.id), String(req.params.userId));
        res.status(200).json({
            message: "Membre supprimé avec succès",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCompanyMemberController = deleteCompanyMemberController;
