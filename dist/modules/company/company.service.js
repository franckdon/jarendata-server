"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCompanyMemberService = exports.updateCompanyMemberStatusService = exports.updateCompanyMemberRoleService = exports.createCompanyMemberService = exports.deleteCompanyService = exports.updateCompanyStatusService = exports.updateCompanyService = exports.getCompanyByIdService = exports.getCompaniesService = exports.updateMyCompanyService = exports.getMyCompanyService = exports.createCompanyService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma_1 = require("../../config/prisma");
const appError_1 = require("../../utils/appError");
const slug_1 = require("../../utils/slug");
const pagination_1 = require("../../utils/pagination");
const bcrypt_1 = __importDefault(require("bcrypt"));
const MAX_COMPANY_MEMBERS = 5;
const removeOldLogo = (logoUrl) => {
    if (!logoUrl)
        return;
    const relativePath = logoUrl.replace(/^\/+/, "");
    const filePath = path_1.default.join(process.cwd(), relativePath);
    if (fs_1.default.existsSync(filePath)) {
        fs_1.default.unlinkSync(filePath);
    }
};
const generateUniqueCompanySlug = async (name, currentCompanyId) => {
    const baseSlug = (0, slug_1.generateSlug)(name);
    const existingCompany = await prisma_1.prisma.company.findUnique({
        where: { slug: baseSlug },
    });
    if (!existingCompany)
        return baseSlug;
    if (currentCompanyId && existingCompany.id === currentCompanyId) {
        return baseSlug;
    }
    return `${baseSlug}-${Date.now()}`;
};
const createCompanyService = async (data, logoUrl) => {
    const slug = await generateUniqueCompanySlug(data.name);
    const company = await prisma_1.prisma.company.create({
        data: {
            name: data.name,
            slug,
            email: data.email,
            phone: data.phone,
            website: data.website,
            country: data.country,
            city: data.city,
            address: data.address,
            industry: data.industry,
            size: data.size,
            status: data.status,
            logoUrl,
        },
    });
    return company;
};
exports.createCompanyService = createCompanyService;
const getMyCompanyService = async (userId) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        include: {
            company: true,
        },
    });
    if (!user) {
        throw new appError_1.AppError("Utilisateur introuvable", 404);
    }
    if (!user.company) {
        throw new appError_1.AppError("Aucune entreprise associée à cet utilisateur", 404);
    }
    return user.company;
};
exports.getMyCompanyService = getMyCompanyService;
const updateMyCompanyService = async (userId, data, logoUrl) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        include: { company: true },
    });
    if (!user || !user.companyId || !user.company) {
        throw new appError_1.AppError("Entreprise introuvable", 404);
    }
    let slug;
    if (data.name && data.name !== user.company.name) {
        slug = await generateUniqueCompanySlug(data.name, user.companyId);
    }
    if (logoUrl && user.company.logoUrl) {
        removeOldLogo(user.company.logoUrl);
    }
    const company = await prisma_1.prisma.company.update({
        where: { id: user.companyId },
        data: {
            ...data,
            ...(slug ? { slug } : {}),
            ...(logoUrl ? { logoUrl } : {}),
        },
    });
    return company;
};
exports.updateMyCompanyService = updateMyCompanyService;
const getCompaniesService = async (query) => {
    const search = query.search?.trim();
    const where = search
        ? {
            OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { phone: { contains: search, mode: "insensitive" } },
                { country: { contains: search, mode: "insensitive" } },
                { city: { contains: search, mode: "insensitive" } },
                { industry: { contains: search, mode: "insensitive" } },
            ],
        }
        : {};
    return (0, pagination_1.paginate)({
        model: prisma_1.prisma.company,
        page: query.page,
        limit: query.limit,
        where,
        orderBy: { createdAt: "desc" },
        include: {
            users: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    role: true,
                    companyRole: true,
                    isActive: true,
                },
            },
        },
    });
};
exports.getCompaniesService = getCompaniesService;
const getCompanyByIdService = async (companyId) => {
    const company = await prisma_1.prisma.company.findUnique({
        where: { id: companyId },
        include: {
            users: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    role: true,
                    companyRole: true,
                    isActive: true,
                    createdAt: true,
                },
            },
        },
    });
    if (!company) {
        throw new appError_1.AppError("Entreprise introuvable", 404);
    }
    return company;
};
exports.getCompanyByIdService = getCompanyByIdService;
const updateCompanyService = async (companyId, data, logoUrl) => {
    const company = await prisma_1.prisma.company.findUnique({
        where: { id: companyId },
    });
    if (!company) {
        throw new appError_1.AppError("Entreprise introuvable", 404);
    }
    let slug;
    if (data.name && data.name !== company.name) {
        slug = await generateUniqueCompanySlug(data.name, companyId);
    }
    if (logoUrl && company.logoUrl) {
        removeOldLogo(company.logoUrl);
    }
    const updatedCompany = await prisma_1.prisma.company.update({
        where: { id: companyId },
        data: {
            ...data,
            ...(slug ? { slug } : {}),
            ...(logoUrl ? { logoUrl } : {}),
        },
    });
    return updatedCompany;
};
exports.updateCompanyService = updateCompanyService;
const updateCompanyStatusService = async (companyId, data) => {
    const company = await prisma_1.prisma.company.findUnique({
        where: { id: companyId },
    });
    if (!company) {
        throw new appError_1.AppError("Entreprise introuvable", 404);
    }
    const updatedCompany = await prisma_1.prisma.company.update({
        where: { id: companyId },
        data: {
            status: data.status,
        },
    });
    return updatedCompany;
};
exports.updateCompanyStatusService = updateCompanyStatusService;
const deleteCompanyService = async (companyId) => {
    const company = await prisma_1.prisma.company.findUnique({
        where: { id: companyId },
    });
    if (!company) {
        throw new appError_1.AppError("Entreprise introuvable", 404);
    }
    await prisma_1.prisma.company.delete({
        where: { id: companyId },
    });
    removeOldLogo(company.logoUrl);
};
exports.deleteCompanyService = deleteCompanyService;
const createCompanyMemberService = async (companyId, data) => {
    const company = await prisma_1.prisma.company.findUnique({
        where: { id: companyId },
    });
    if (!company) {
        throw new appError_1.AppError("Entreprise introuvable", 404);
    }
    const membersCount = await prisma_1.prisma.user.count({
        where: {
            companyId,
            role: "COMPANY",
        },
    });
    if (membersCount >= MAX_COMPANY_MEMBERS) {
        throw new appError_1.AppError(`Limite atteinte : une équipe ne peut pas dépasser ${MAX_COMPANY_MEMBERS} membres pour le moment`, 403);
    }
    const existingUser = await prisma_1.prisma.user.findUnique({
        where: { email: data.email },
    });
    if (existingUser) {
        throw new appError_1.AppError("Un utilisateur avec cet email existe déjà", 409);
    }
    const hashedPassword = await bcrypt_1.default.hash(data.password, 10);
    return prisma_1.prisma.user.create({
        data: {
            fullName: data.fullName,
            email: data.email,
            password: hashedPassword,
            role: "COMPANY",
            companyRole: data.companyRole,
            companyId,
            isActive: true,
        },
        select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            companyRole: true,
            isActive: true,
            createdAt: true,
        },
    });
};
exports.createCompanyMemberService = createCompanyMemberService;
const updateCompanyMemberRoleService = async (companyId, userId, data) => {
    const member = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
    });
    if (!member || member.companyId !== companyId) {
        throw new appError_1.AppError("Membre introuvable dans cette entreprise", 404);
    }
    if (member.companyRole === "OWNER") {
        throw new appError_1.AppError("Le rôle du propriétaire ne peut pas être modifié", 403);
    }
    return prisma_1.prisma.user.update({
        where: { id: userId },
        data: {
            companyRole: data.companyRole,
        },
        select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            companyRole: true,
            isActive: true,
            updatedAt: true,
        },
    });
};
exports.updateCompanyMemberRoleService = updateCompanyMemberRoleService;
const updateCompanyMemberStatusService = async (companyId, userId, data) => {
    const member = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
    });
    if (!member || member.companyId !== companyId) {
        throw new appError_1.AppError("Membre introuvable dans cette entreprise", 404);
    }
    if (member.companyRole === "OWNER") {
        throw new appError_1.AppError("Le propriétaire ne peut pas être désactivé", 403);
    }
    return prisma_1.prisma.user.update({
        where: { id: userId },
        data: {
            isActive: data.isActive,
        },
        select: {
            id: true,
            fullName: true,
            email: true,
            companyRole: true,
            isActive: true,
            updatedAt: true,
        },
    });
};
exports.updateCompanyMemberStatusService = updateCompanyMemberStatusService;
const deleteCompanyMemberService = async (companyId, userId) => {
    const member = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
    });
    if (!member || member.companyId !== companyId) {
        throw new appError_1.AppError("Membre introuvable dans cette entreprise", 404);
    }
    if (member.companyRole === "OWNER") {
        throw new appError_1.AppError("Le propriétaire ne peut pas être supprimé", 403);
    }
    await prisma_1.prisma.user.delete({
        where: { id: userId },
    });
    return true;
};
exports.deleteCompanyMemberService = deleteCompanyMemberService;
