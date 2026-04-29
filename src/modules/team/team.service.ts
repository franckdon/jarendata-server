import bcrypt from "bcrypt";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/appError";
import {
  CreateTeamMemberInput,
  UpdateTeamMemberRoleInput,
  UpdateTeamMemberStatusInput,
} from "./team.validation";

const MAX_TEAM_MEMBERS = 5;

export const getTeamService = async (companyId?: string | null) => {
  if (!companyId) {
    throw new AppError("Entreprise introuvable", 404);
  }

  const members = await prisma.user.findMany({
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

export const createTeamMemberService = async (
  companyId: string | null | undefined,
  data: CreateTeamMemberInput
) => {
  if (!companyId) {
    throw new AppError("Entreprise introuvable", 404);
  }

  const membersCount = await prisma.user.count({
    where: {
      companyId,
      role: "COMPANY",
    },
  });

  if (membersCount >= MAX_TEAM_MEMBERS) {
    throw new AppError(
      `Limite atteinte : une équipe ne peut pas dépasser ${MAX_TEAM_MEMBERS} membres pour le moment`,
      403
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (existingUser) {
    throw new AppError("Un utilisateur avec cet email existe déjà", 409);
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const member = await prisma.user.create({
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

export const updateTeamMemberRoleService = async (
  companyId: string | null | undefined,
  userId: string,
  data: UpdateTeamMemberRoleInput
) => {
  if (!companyId) {
    throw new AppError("Entreprise introuvable", 404);
  }

  const member = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!member || member.companyId !== companyId) {
    throw new AppError("Membre introuvable dans cette entreprise", 404);
  }

  if (member.companyRole === "OWNER") {
    throw new AppError("Le rôle du propriétaire ne peut pas être modifié", 403);
  }

  const updatedMember = await prisma.user.update({
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

export const updateTeamMemberStatusService = async (
  companyId: string | null | undefined,
  userId: string,
  data: UpdateTeamMemberStatusInput
) => {
  if (!companyId) {
    throw new AppError("Entreprise introuvable", 404);
  }

  const member = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!member || member.companyId !== companyId) {
    throw new AppError("Membre introuvable dans cette entreprise", 404);
  }

  if (member.companyRole === "OWNER") {
    throw new AppError("Le propriétaire ne peut pas être désactivé", 403);
  }

  const updatedMember = await prisma.user.update({
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

export const deleteTeamMemberService = async (
  companyId: string | null | undefined,
  userId: string
) => {
  if (!companyId) {
    throw new AppError("Entreprise introuvable", 404);
  }

  const member = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!member || member.companyId !== companyId) {
    throw new AppError("Membre introuvable dans cette entreprise", 404);
  }

  if (member.companyRole === "OWNER") {
    throw new AppError("Le propriétaire ne peut pas être supprimé", 403);
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  return true;
};