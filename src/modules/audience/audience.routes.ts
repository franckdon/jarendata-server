import { Router } from "express";
import {
  createContactController,
  deleteContactController,
  getContactByIdController,
  getContactsController,
  importContactsController,
  optInContactController,
  syncContactFromApiController,
  updateContactController,
} from "./audience.controller";
import {
  authMiddleware,
  authorizeCompanyRoles,
  authorizeRoles,
} from "../../middlewares/auth.middleware";

const router = Router();

/**
 * PUBLIC
 * QR Code / WhatsApp opt-in
 * Exemple : client scanne QR Code boutique et enregistre son consentement.
 */
router.post("/opt-in", optInContactController);

/**
 * PRIVATE COMPANY ROUTES
 */
router.use(authMiddleware);
router.use(authorizeRoles("COMPANY"));

router.get(
  "/",
  authorizeCompanyRoles("OWNER", "MANAGER", "ANALYST", "MEMBER"),
  getContactsController
);

/**
 * Option A MVP :
 * Le vendeur demande le numéro et le saisit dans Jarendata.
 */
router.post(
  "/",
  authorizeCompanyRoles("OWNER", "MANAGER"),
  createContactController
);

/**
 * Option 1 :
 * Import manuel liste clients.
 * MVP JSON maintenant, CSV réel plus tard avec multer.
 */
router.post(
  "/import",
  authorizeCompanyRoles("OWNER", "MANAGER"),
  importContactsController
);

/**
 * Option 2 :
 * Synchronisation POS / ERP / site.
 * Exemple : Sage, caisse, e-commerce, formulaire externe.
 */
router.post(
  "/sync",
  authorizeCompanyRoles("OWNER", "MANAGER"),
  syncContactFromApiController
);

router.get(
  "/:id",
  authorizeCompanyRoles("OWNER", "MANAGER", "ANALYST", "MEMBER"),
  getContactByIdController
);

router.patch(
  "/:id",
  authorizeCompanyRoles("OWNER", "MANAGER"),
  updateContactController
);

router.delete(
  "/:id",
  authorizeCompanyRoles("OWNER"),
  deleteContactController
);

export default router;