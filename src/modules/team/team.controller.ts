import { NextFunction, Request, Response } from "express";
import {
  createTeamMemberService,
  deleteTeamMemberService,
  getTeamService,
  updateTeamMemberRoleService,
  updateTeamMemberStatusService,
} from "./team.service";
import {
  createTeamMemberSchema,
  updateTeamMemberRoleSchema,
  updateTeamMemberStatusSchema,
} from "./team.validation";

export const getTeamController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const members = await getTeamService(req.user.companyId);

    res.status(200).json({
      message: "Équipe récupérée avec succès",
      data: members,
    });
  } catch (error) {
    next(error);
  }
};

export const createTeamMemberController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = createTeamMemberSchema.parse(req.body);
    const member = await createTeamMemberService(req.user.companyId, data);

    res.status(201).json({
      message: "Membre ajouté avec succès",
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTeamMemberRoleController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = updateTeamMemberRoleSchema.parse(req.body);

    const member = await updateTeamMemberRoleService(
      req.user.companyId,
      String(req.params.userId),
      data
    );

    res.status(200).json({
      message: "Rôle du membre mis à jour avec succès",
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTeamMemberStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = updateTeamMemberStatusSchema.parse(req.body);

    const member = await updateTeamMemberStatusService(
      req.user.companyId,
      String(req.params.userId),
      data
    );

    res.status(200).json({
      message: "Statut du membre mis à jour avec succès",
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTeamMemberController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await deleteTeamMemberService(req.user.companyId, String(req.params.userId));

    res.status(200).json({
      message: "Membre supprimé avec succès",
    });
  } catch (error) {
    next(error);
  }
};