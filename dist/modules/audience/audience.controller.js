"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteContactController = exports.updateContactController = exports.getContactByIdController = exports.optInContactController = exports.syncContactFromApiController = exports.importContactsController = exports.createContactController = exports.getContactsController = void 0;
const audience_service_1 = require("./audience.service");
const audience_validation_1 = require("./audience.validation");
const getContactsController = async (req, res, next) => {
    try {
        const contacts = await (0, audience_service_1.getContactsService)(req.user.companyId, req.query);
        res.status(200).json({
            message: "Audience récupérée avec succès",
            ...contacts,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getContactsController = getContactsController;
const createContactController = async (req, res, next) => {
    try {
        const data = audience_validation_1.createContactSchema.parse(req.body);
        const contact = await (0, audience_service_1.createContactService)(req.user.companyId, data);
        res.status(201).json({
            message: "Contact ajouté avec succès",
            data: contact,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createContactController = createContactController;
const importContactsController = async (req, res, next) => {
    try {
        const data = audience_validation_1.importContactsSchema.parse(req.body);
        const result = await (0, audience_service_1.importContactsService)(req.user.companyId, data);
        res.status(201).json({
            message: "Import audience terminé",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.importContactsController = importContactsController;
const syncContactFromApiController = async (req, res, next) => {
    try {
        const data = audience_validation_1.syncContactSchema.parse(req.body);
        const result = await (0, audience_service_1.syncContactFromApiService)(req.user.companyId, data);
        res.status(200).json({
            message: "Contact synchronisé avec succès",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.syncContactFromApiController = syncContactFromApiController;
const optInContactController = async (req, res, next) => {
    try {
        const data = audience_validation_1.optInContactSchema.parse(req.body);
        const result = await (0, audience_service_1.optInContactService)(data);
        res.status(201).json({
            message: "Opt-in enregistré avec succès",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.optInContactController = optInContactController;
const getContactByIdController = async (req, res, next) => {
    try {
        const contact = await (0, audience_service_1.getContactByIdService)(req.user.companyId, String(req.params.id));
        res.status(200).json({
            message: "Contact récupéré avec succès",
            data: contact,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getContactByIdController = getContactByIdController;
const updateContactController = async (req, res, next) => {
    try {
        const data = audience_validation_1.updateContactSchema.parse(req.body);
        const contact = await (0, audience_service_1.updateContactService)(req.user.companyId, String(req.params.id), data);
        res.status(200).json({
            message: "Contact mis à jour avec succès",
            data: contact,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateContactController = updateContactController;
const deleteContactController = async (req, res, next) => {
    try {
        await (0, audience_service_1.deleteContactService)(req.user.companyId, String(req.params.id));
        res.status(200).json({
            message: "Contact supprimé avec succès",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteContactController = deleteContactController;
