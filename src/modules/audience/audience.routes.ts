import { Router } from "express";
import {
  createContactController,
  deleteContactController,
  getContactByIdController,
  getContactsController,
  updateContactController,
} from "./audience.controller";
import {
  authMiddleware,
  authorizeCompanyRoles,
  authorizeRoles,
} from "../../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);
router.use(authorizeRoles("COMPANY"));

router.get(
  "/",
  authorizeCompanyRoles("OWNER", "MANAGER", "ANALYST", "MEMBER"),
  getContactsController
);

router.post(
  "/",
  authorizeCompanyRoles("OWNER", "MANAGER"),
  createContactController
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