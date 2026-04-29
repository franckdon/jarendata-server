import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/appError";
import { generateSlug } from "../../utils/slug";
import {
  UpdateCompanyInput,
  UpdateCompanyStatusInput,
} from "./company.validation";
import { paginate, PaginationQuery } from "../../utils/pagination";

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
  data: UpdateCompanyInput
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { company: true },
  });

  if (!user || !user.companyId) {
    throw new AppError("Entreprise introuvable", 404);
  }

  let slug: string | undefined;

  if (data.name && data.name !== user.company?.name) {
    const baseSlug = generateSlug(data.name);

    const existingCompany = await prisma.company.findUnique({
      where: { slug: baseSlug },
    });

    slug =
      existingCompany && existingCompany.id !== user.companyId
        ? `${baseSlug}-${Date.now()}`
        : baseSlug;
  }

  const company = await prisma.company.update({
    where: { id: user.companyId },
    data: {
      ...data,
      ...(slug ? { slug } : {}),
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