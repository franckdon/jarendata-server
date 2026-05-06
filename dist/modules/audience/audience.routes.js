"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const audience_controller_1 = require("./audience.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
/**
 * PUBLIC
 * QR Code / WhatsApp opt-in
 * Exemple : client scanne QR Code boutique et enregistre son consentement.
 */
router.post("/opt-in", audience_controller_1.optInContactController);
/**
 * PRIVATE COMPANY ROUTES
 */
router.use(auth_middleware_1.authMiddleware);
router.use((0, auth_middleware_1.authorizeRoles)("COMPANY"));
router.get("/", (0, auth_middleware_1.authorizeCompanyRoles)("OWNER", "MANAGER", "ANALYST", "MEMBER"), audience_controller_1.getContactsController);
/**
 * Option A MVP :
 * Le vendeur demande le numéro et le saisit dans Jarendata.
 */
router.post("/", (0, auth_middleware_1.authorizeCompanyRoles)("OWNER", "MANAGER"), audience_controller_1.createContactController);
/**
 * Option 1 :
 * Import manuel liste clients.
 * MVP JSON maintenant, CSV réel plus tard avec multer.
 */
router.post("/import", (0, auth_middleware_1.authorizeCompanyRoles)("OWNER", "MANAGER"), audience_controller_1.importContactsController);
/**
 * Option 2 :
 * Synchronisation POS / ERP / site.
 * Exemple : Sage, caisse, e-commerce, formulaire externe.
 */
router.post("/sync", (0, auth_middleware_1.authorizeCompanyRoles)("OWNER", "MANAGER"), audience_controller_1.syncContactFromApiController);
router.get("/:id", (0, auth_middleware_1.authorizeCompanyRoles)("OWNER", "MANAGER", "ANALYST", "MEMBER"), audience_controller_1.getContactByIdController);
router.patch("/:id", (0, auth_middleware_1.authorizeCompanyRoles)("OWNER", "MANAGER"), audience_controller_1.updateContactController);
router.delete("/:id", (0, auth_middleware_1.authorizeCompanyRoles)("OWNER"), audience_controller_1.deleteContactController);
exports.default = router;
