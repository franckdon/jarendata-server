"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMeService = exports.getMeService = exports.loginService = exports.registerService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = require("../../config/prisma");
const appError_1 = require("../../utils/appError");
const jwt_1 = require("../../utils/jwt");
const slug_1 = require("../../utils/slug");
const registerService = async (data) => {
    const existingUser = await prisma_1.prisma.user.findUnique({
        where: { email: data.email },
    });
    if (existingUser) {
        throw new appError_1.AppError("Un utilisateur avec cet email existe déjà", 409);
    }
    const baseSlug = (0, slug_1.generateSlug)(data.companyName);
    const existingCompany = await prisma_1.prisma.company.findUnique({
        where: { slug: baseSlug },
    });
    const finalSlug = existingCompany
        ? `${baseSlug}-${Date.now()}`
        : baseSlug;
    const hashedPassword = await bcrypt_1.default.hash(data.password, 10);
    const result = await prisma_1.prisma.$transaction(async (tx) => {
        const company = await tx.company.create({
            data: {
                name: data.companyName,
                slug: finalSlug,
                country: data.companyCountry,
                city: data.companyCity,
                phone: data.companyPhone,
                industry: data.companyIndustry,
                status: "PENDING",
                creditBalance: 100,
            },
        });
        const user = await tx.user.create({
            data: {
                fullName: data.fullName,
                email: data.email,
                password: hashedPassword,
                role: "COMPANY",
                companyRole: "OWNER",
                companyId: company.id,
            },
            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                companyRole: true,
                isActive: true,
                company: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        country: true,
                        city: true,
                        industry: true,
                        status: true,
                        creditBalance: true,
                    },
                },
            },
        });
        return { user, company };
    });
    const token = (0, jwt_1.generateToken)({
        userId: result.user.id,
        role: result.user.role,
        companyId: result.user.company?.id,
        companyRole: result.user.companyRole,
    });
    return {
        user: result.user,
        token,
    };
};
exports.registerService = registerService;
const loginService = async (data) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { email: data.email },
        include: {
            company: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    country: true,
                    city: true,
                    industry: true,
                    status: true,
                    creditBalance: true,
                },
            },
        },
    });
    if (!user) {
        throw new appError_1.AppError("Email ou mot de passe incorrect", 401);
    }
    if (!user.isActive) {
        throw new appError_1.AppError("Ce compte est désactivé", 403);
    }
    const isPasswordValid = await bcrypt_1.default.compare(data.password, user.password);
    if (!isPasswordValid) {
        throw new appError_1.AppError("Email ou mot de passe incorrect", 401);
    }
    const token = (0, jwt_1.generateToken)({
        userId: user.id,
        role: user.role,
        companyId: user.companyId,
        companyRole: user.companyRole,
    });
    return {
        user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            companyRole: user.companyRole,
            isActive: user.isActive,
            company: user.company,
        },
        token,
    };
};
exports.loginService = loginService;
const getMeService = async (userId) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            companyRole: true,
            isActive: true,
            createdAt: true,
            company: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    email: true,
                    phone: true,
                    website: true,
                    logoUrl: true,
                    country: true,
                    city: true,
                    address: true,
                    industry: true,
                    size: true,
                    status: true,
                    creditBalance: true,
                    createdAt: true,
                },
            },
        },
    });
    if (!user) {
        throw new appError_1.AppError("Utilisateur introuvable", 404);
    }
    return user;
};
exports.getMeService = getMeService;
const updateMeService = async (userId, data) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new appError_1.AppError("Utilisateur introuvable", 404);
    }
    if (data.email && data.email !== user.email) {
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw new appError_1.AppError("Un utilisateur avec cet email existe déjà", 409);
        }
    }
    let hashedPassword;
    if (data.newPassword) {
        const isPasswordValid = await bcrypt_1.default.compare(data.currentPassword, user.password);
        if (!isPasswordValid) {
            throw new appError_1.AppError("Le mot de passe actuel est incorrect", 401);
        }
        hashedPassword = await bcrypt_1.default.hash(data.newPassword, 10);
    }
    return prisma_1.prisma.user.update({
        where: { id: userId },
        data: {
            ...(data.fullName ? { fullName: data.fullName } : {}),
            ...(data.email ? { email: data.email } : {}),
            ...(hashedPassword ? { password: hashedPassword } : {}),
        },
        select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            companyRole: true,
            isActive: true,
            company: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    email: true,
                    phone: true,
                    website: true,
                    logoUrl: true,
                    country: true,
                    city: true,
                    address: true,
                    industry: true,
                    size: true,
                    status: true,
                    creditBalance: true,
                },
            },
        },
    });
};
exports.updateMeService = updateMeService;
