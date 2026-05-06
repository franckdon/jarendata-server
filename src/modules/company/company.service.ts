import fs from "fs";
import path from "path";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/appError";
import { generateSlug } from "../../utils/slug";
import {
  CreateCompanyInput,
  CreateCompanyMemberInput,
  UpdateCompanyInput,
  UpdateCompanyMemberRoleInput,
  UpdateCompanyMemberStatusInput,
  UpdateCompanyStatusInput,
} from "./company.validation";
import { paginate, PaginationQuery } from "../../utils/pagination";
import bcrypt from "bcrypt";

const MAX_COMPANY_MEMBERS = 5;

const removeOldLogo = (logoUrl?: string | null) => {
  if (!logoUrl) return;

  const relativePath = logoUrl.replace(/^\/+/, "");
  const filePath = path.join(process.cwd(), relativePath);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const generateUniqueCompanySlug = async (
  name: string,
  currentCompanyId?: string
) => {
  const baseSlug = generateSlug(name);

  const existingCompany = await prisma.company.findUnique({
    where: { slug: baseSlug },
  });

  if (!existingCompany) return baseSlug;

  if (currentCompanyId && existingCompany.id === currentCompanyId) {
    return baseSlug;
  }

  return `${baseSlug}-${Date.now()}`;
};

export const createCompanyService = async (
  data: CreateCompanyInput,
  logoUrl?: string
) => {
  const slug = await generateUniqueCompanySlug(data.name);

  const company = await prisma.company.create({
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

export const getMyCompanyService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      company: true,
    },
  });

  if (!user) {
    throw new AppError("Utilisateur introuvable", 404);
  }

  if (!user.company) {
    throw new AppError("Aucune entreprise associée à cet utilisateur", 404);
  }

  return user.company;
};

export const updateMyCompanyService = async (
  userId: string,
  data: UpdateCompanyInput,
  logoUrl?: string
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { company: true },
  });

  if (!user || !user.companyId || !user.company) {
    throw new AppError("Entreprise introuvable", 404);
  }

  let slug: string | undefined;

  if (data.name && data.name !== user.company.name) {
    slug = await generateUniqueCompanySlug(data.name, user.companyId);
  }

  if (logoUrl && user.company.logoUrl) {
    removeOldLogo(user.company.logoUrl);
  }

  const company = await prisma.company.update({
    where: { id: user.companyId },
    data: {
      ...data,
      ...(slug ? { slug } : {}),
      ...(logoUrl ? { logoUrl } : {}),
    },
  });

  return company;
};

export const getCompaniesService = async (query: PaginationQuery) => {
  const search = query.search?.trim();

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search, mode: "insensitive" as const } },
          { country: { contains: search, mode: "insensitive" as const } },
          { city: { contains: search, mode: "insensitive" as const } },
          { industry: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  return paginate({
    model: prisma.company,
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

export const getCompanyByIdService = async (companyId: string) => {
  const company = await prisma.company.findUnique({
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
    throw new AppError("Entreprise introuvable", 404);
  }

  return company;
};

export const updateCompanyService = async (
  companyId: string,
  data: UpdateCompanyInput,
  logoUrl?: string
) => {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    throw new AppError("Entreprise introuvable", 404);
  }

  let slug: string | undefined;

  if (data.name && data.name !== company.name) {
    slug = await generateUniqueCompanySlug(data.name, companyId);
  }

  if (logoUrl && company.logoUrl) {
    removeOldLogo(company.logoUrl);
  }

  const updatedCompany = await prisma.company.update({
    where: { id: companyId },
    data: {
      ...data,
      ...(slug ? { slug } : {}),
      ...(logoUrl ? { logoUrl } : {}),
    },
  });

  return updatedCompany;
};

export const updateCompanyStatusService = async (
  companyId: string,
  data: UpdateCompanyStatusInput
) => {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    throw new AppError("Entreprise introuvable", 404);
  }

  const updatedCompany = await prisma.company.update({
    where: { id: companyId },
    data: {
      status: data.status,
    },
  });

  return updatedCompany;
};

export const deleteCompanyService = async (companyId: string) => {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    throw new AppError("Entreprise introuvable", 404);
  }

  await prisma.company.delete({
    where: { id: companyId },
  });

  removeOldLogo(company.logoUrl);
};


export const createCompanyMemberService = async (
  companyId: string,
  data: CreateCompanyMemberInput
) => {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    throw new AppError("Entreprise introuvable", 404);
  }

  const membersCount = await prisma.user.count({
    where: {
      companyId,
      role: "COMPANY",
    },
  });

  if (membersCount >= MAX_COMPANY_MEMBERS) {
    throw new AppError(
      `Limite atteinte : une équipe ne peut pas dépasser ${MAX_COMPANY_MEMBERS} membres pour le moment`,
      403
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new AppError("Un utilisateur avec cet email existe déjà", 409);
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  return prisma.user.create({
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

export const updateCompanyMemberRoleService = async (
  companyId: string,
  userId: string,
  data: UpdateCompanyMemberRoleInput
) => {
  const member = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!member || member.companyId !== companyId) {
    throw new AppError("Membre introuvable dans cette entreprise", 404);
  }

  if (member.companyRole === "OWNER") {
    throw new AppError("Le rôle du propriétaire ne peut pas être modifié", 403);
  }

  return prisma.user.update({
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

export const updateCompanyMemberStatusService = async (
  companyId: string,
  userId: string,
  data: UpdateCompanyMemberStatusInput
) => {
  const member = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!member || member.companyId !== companyId) {
    throw new AppError("Membre introuvable dans cette entreprise", 404);
  }

  if (member.companyRole === "OWNER") {
    throw new AppError("Le propriétaire ne peut pas être désactivé", 403);
  }

  return prisma.user.update({
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

export const deleteCompanyMemberService = async (
  companyId: string,
  userId: string
) => {
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