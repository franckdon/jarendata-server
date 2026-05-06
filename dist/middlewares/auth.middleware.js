"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeCompanyRoles = exports.authorizeRoles = exports.authMiddleware = void 0;
const appError_1 = require("../utils/appError");
const jwt_1 = require("../utils/jwt");
const authMiddleware = (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new appError_1.AppError("Token manquant", 401);
        }
        const token = authHeader.split(" ")[1];
        const decoded = (0, jwt_1.verifyToken)(token);
        req.user = {
            userId: decoded.userId,
            role: decoded.role,
            companyId: decoded.companyId,
            companyRole: decoded.companyRole,
        };
        next();
    }
    catch (error) {
        next(new appError_1.AppError("Token invalide ou expiré", 401));
    }
};
exports.authMiddleware = authMiddleware;
const authorizeRoles = (...roles) => {
    return (req, _res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new appError_1.AppError("Accès non autorisé", 403));
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
const authorizeCompanyRoles = (...companyRoles) => {
    return (req, _res, next) => {
        if (!req.user.companyRole || !companyRoles.includes(req.user.companyRole)) {
            return next(new appError_1.AppError("Permission entreprise insuffisante", 403));
        }
        next();
    };
};
exports.authorizeCompanyRoles = authorizeCompanyRoles;
