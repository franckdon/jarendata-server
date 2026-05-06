import { Request, Response, NextFunction } from "express";
import { loginSchema, registerSchema, updateMeSchema } from "./auth.validation";
import { getMeService, loginService, registerService, updateMeService } from "./auth.service";

export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await registerService(data);

    res.status(201).json({
      message: "Compte créé avec succès",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await loginService(data);

    res.status(200).json({
      message: "Connexion réussie",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const meController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.userId;
    const user = await getMeService(userId);

    res.status(200).json({
      message: "Utilisateur connecté",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Controller pour mettre à jour le profil de l'utilisateur connecté
export const updateMeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = updateMeSchema.parse(req.body);
    const user = await updateMeService(req.user.userId, data);

    res.status(200).json({
      message: "Profil mis à jour avec succès",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};