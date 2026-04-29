import { NextFunction, Request, Response } from "express";
import {
  getCompaniesService,
  getCompanyByIdService,
  getMyCompanyService,
  updateCompanyStatusService,
  updateMyCompanyService,
} from "./company.service";
import {
  updateCompanySchema,
  updateCompanyStatusSchema,
} from "./company.validation";

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
    const company = await updateMyCompanyService(req.user.userId, data);

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