import { NextFunction, Request, Response } from "express";
import {
  addCreditsService,
  adminGetCompanyCreditTransactionsService,
  adjustCreditsService,
  getMyCreditBalanceService,
  getMyCreditTransactionsService,
} from "./credit.service";
import { addCreditsSchema, adjustCreditsSchema } from "./credit.validation";

export const getMyCreditBalanceController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const balance = await getMyCreditBalanceService(req.user.companyId);

    res.status(200).json({
      message: "Solde de crédits récupéré avec succès",
      data: balance,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyCreditTransactionsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const transactions = await getMyCreditTransactionsService(
      req.user.companyId,
      req.query
    );

    res.status(200).json({
      message: "Historique des crédits récupéré avec succès",
      ...transactions,
    });
  } catch (error) {
    next(error);
  }
};

export const adminGetCompanyCreditTransactionsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const transactions = await adminGetCompanyCreditTransactionsService(
      req.params.companyId,
      req.query
    );

    res.status(200).json({
      message: "Historique des crédits de l’entreprise récupéré avec succès",
      ...transactions,
    });
  } catch (error) {
    next(error);
  }
};

export const addCreditsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = addCreditsSchema.parse(req.body);
    const result = await addCreditsService(req.user.userId, data);

    res.status(201).json({
      message: "Crédits ajoutés avec succès",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const adjustCreditsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = adjustCreditsSchema.parse(req.body);
    const result = await adjustCreditsService(req.user.userId, data);

    res.status(200).json({
      message: "Crédits ajustés avec succès",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};