import fs from "fs";
import path from "path";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/appError";
import { generateSlug } from "../../utils/slug";
import {
  CreateCompanyInput,
  UpdateCompanyInput,
  UpdateCompanyStatusInput,
} from "./company.validation";
import { paginate, PaginationQuery } from "../../utils/pagination";

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