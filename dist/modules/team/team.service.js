"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTeamMemberService = exports.updateTeamMemberStatusService = exports.updateTeamMemberRoleService = exports.createTeamMemberService = exports.getTeamService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = require("../../config/prisma");
const appError_1 = require("../../utils/appError");
const MAX_TEAM_MEMBERS = 5;
const getTeamService = async (companyId) => {
    if (!companyId) {
        throw new appError_1.AppError("Entreprise introuvable", 404);
    }
    const members = await prisma_1.prisma.user.findMany({
        where: {
            companyId,
            role: "COMPANY",
        },
        orderBy: {
            createdAt: "asc",
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
    return members;
};
exports.getTeamService = getTeamService;
const createTeamMemberService = async (companyId, data) => {
    if (!companyId) {
        throw new appError_1.AppError("Entreprise introuvable", 404);
    }
    const membersCount = await prisma_1.prisma.user.count({
        where: {
            companyId,
            role: "COMPANY",
        },
    });
    if (membersCount >= MAX_TEAM_MEMBERS) {
        throw new appError_1.AppError(`Limite atteinte : une équipe ne peut pas dépasser ${MAX_TEAM_MEMBERS} membres pour le moment`, 403);
    }
    const existingUser = await prisma_1.prisma.user.findUnique({
        where: {
            email: data.email,
        },
    });
    if (existingUser) {
        throw new appError_1.AppError("Un utilisateur avec cet email existe déjà", 409);
    }
    const hashedPassword = await bcrypt_1.default.hash(data.password, 10);
    const member = await prisma_1.prisma.user.create({
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
    return member;
};
exports.createTeamMemberService = createTeamMemberService;
const updateTeamMemberRoleService = async (companyId, userId, data) => {
    if (!companyId) {
        throw new appError_1.AppError("Entreprise introuvable", 404);
    }
    const member = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
    });
    if (!member || member.companyId !== companyId) {
        throw new appError_1.AppError("Membre introuvable dans cette entreprise", 404);
    }
    if (member.companyRole === "OWNER") {
        throw new appError_1.AppError("Le rôle du propriétaire ne peut pas être modifié", 403);
    }
    const updatedMember = await prisma_1.prisma.user.update({
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
    return updatedMember;
};
exports.updateTeamMemberRoleService = updateTeamMemberRoleService;
const updateTeamMemberStatusService = async (companyId, userId, data) => {
    if (!companyId) {
        throw new appError_1.AppError("Entreprise introuvable", 404);
    }
    const member = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
    });
    if (!member || member.companyId !== companyId) {
        throw new appError_1.AppError("Membre introuvable dans cette entreprise", 404);
    }
    if (member.companyRole === "OWNER") {
        throw new appError_1.AppError("Le propriétaire ne peut pas être désactivé", 403);
    }
    const updatedMember = await prisma_1.prisma.user.update({
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
    return updatedMember;
};
exports.updateTeamMemberStatusService = updateTeamMemberStatusService;
const deleteTeamMemberService = async (companyId, userId) => {
    if (!companyId) {
        throw new appError_1.AppError("Entreprise introuvable", 404);
    }
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
exports.deleteTeamMemberService = deleteTeamMemberService;
