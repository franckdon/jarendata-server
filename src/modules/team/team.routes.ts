import { Router } from "express";
import {
  createTeamMemberController,
  deleteTeamMemberController,
  getTeamController,
  updateTeamMemberRoleController,
  updateTeamMemberStatusController,
} from "./team.controller";
import {
  authMiddleware,
  authorizeCompanyRoles,
  authorizeRoles,
} from "../../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);
router.use(authorizeRoles("COMPANY"));

router.get("/", authorizeCompanyRoles("OWNER", "MANAGER"), getTeamController);

router.post("/", authorizeCompanyRoles("OWNER"), createTeamMemberController);

router.patch(
  "/:userId/role",
  authorizeCompanyRoles("OWNER"),
  updateTeamMemberRoleController
);

router.patch(
  "/:userId/status",
  authorizeCompanyRoles("OWNER"),
  updateTeamMemberStatusController
);

router.delete(
  "/:userId",
  authorizeCompanyRoles("OWNER"),
  deleteTeamMemberController
);

export default router;