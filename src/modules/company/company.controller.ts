import { NextFunction, Request, Response } from "express";
import {
  createCompanyMemberService,
  createCompanyService,
  deleteCompanyMemberService,
  deleteCompanyService,
  getCompaniesService,
  getCompanyByIdService,
  getMyCompanyService,
  updateCompanyMemberRoleService,
  updateCompanyMemberStatusService,
  updateCompanyService,
  updateCompanyStatusService,
  updateMyCompanyService,
} from "./company.service";
import {
  createCompanyMemberSchema,
  createCompanySchema,
  updateCompanyMemberRoleSchema,
  updateCompanyMemberStatusSchema,
  updateCompanySchema,
  updateCompanyStatusSchema,
} from "./company.validation";

const getUploadedLogoUrl = (req: Request) => {
  if (!req.file) return undefined;

  return `/uploads/companies/${req.file.filename}`;
};

export const createCompanyController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = createCompanySchema.parse(req.body);
    const logoUrl = getUploadedLogoUrl(req);

    const company = await createCompanyService(data, logoUrl);

    res.status(201).json({
      message: "Entreprise créée avec succès",
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyCompanyController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const company = await getMyCompanyService(req.user.userId);

    res.status(200).json({
      message: "Entreprise récupérée avec succès",
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyCompanyController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = updateCompanySchema.parse(req.body);
    const logoUrl = getUploadedLogoUrl(req);

    const company = await updateMyCompanyService(
      req.user.userId,
      data,
      logoUrl
    );

    res.status(200).json({
      message: "Entreprise mise à jour avec succès",
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

export const getCompaniesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const companies = await getCompaniesService(req.query);

    res.status(200).json({
      message: "Liste des entreprises récupérée avec succès",
      ...companies,
    });
  } catch (error) {
    next(error);
  }
};

export const getCompanyByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const company = await getCompanyByIdService(req.params.id);

    res.status(200).json({
      message: "Entreprise récupérée avec succès",
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCompanyController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = updateCompanySchema.parse(req.body);
    const logoUrl = getUploadedLogoUrl(req);

    const company = await updateCompanyService(req.params.id, data, logoUrl);

    res.status(200).json({
      message: "Entreprise mise à jour avec succès",
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCompanyStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = updateCompanyStatusSchema.parse(req.body);
    const company = await updateCompanyStatusService(req.params.id, data);

    res.status(200).json({
      message: "Statut de l'entreprise mis à jour avec succès",
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCompanyController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await deleteCompanyService(req.params.id);

    res.status(200).json({
      message: "Entreprise supprimée avec succès",
    });
  } catch (error) {
    next(error);
  }
};

export const createCompanyMemberController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = createCompanyMemberSchema.parse(req.body);

    const member = await createCompanyMemberService(req.params.id, data);

    res.status(201).json({
      message: "Membre ajouté avec succès",
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCompanyMemberRoleController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = updateCompanyMemberRoleSchema.parse(req.body);

    const member = await updateCompanyMemberRoleService(
      req.params.id,
      req.params.userId,
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

export const updateCompanyMemberStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = updateCompanyMemberStatusSchema.parse(req.body);

    const member = await updateCompanyMemberStatusService(
      req.params.id,
      req.params.userId,
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

export const deleteCompanyMemberController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await deleteCompanyMemberService(req.params.id, req.params.userId);

    res.status(200).json({
      message: "Membre supprimé avec succès",
    });
  } catch (error) {
    next(error);
  }
};