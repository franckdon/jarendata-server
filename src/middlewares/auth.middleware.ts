import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError";
import { verifyToken } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user: {
        userId: string;
        role: "ADMIN" | "COMPANY";
        companyId?: string | null;
        companyRole?: "OWNER" | "MANAGER" | "ANALYST" | "MEMBER" | null;
      };
    }
  }
}

export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Token manquant", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      companyId: decoded.companyId,
      companyRole: decoded.companyRole,
    };

    next();
  } catch (error) {
    next(new AppError("Token invalide ou expiré", 401));
  }
};

export const authorizeRoles = (...roles: Array<"ADMIN" | "COMPANY">) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Accès non autorisé", 403));
    }

    next();
  };
};

export const authorizeCompanyRoles = (
  ...companyRoles: Array<"OWNER" | "MANAGER" | "ANALYST" | "MEMBER">
) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user.companyRole || !companyRoles.includes(req.user.companyRole)) {
      return next(new AppError("Permission entreprise insuffisante", 403));
    }

    next();
  };
};