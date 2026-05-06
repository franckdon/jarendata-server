import bcrypt from "bcrypt";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/appError";
import { generateToken } from "../../utils/jwt";
import { generateSlug } from "../../utils/slug";
import { LoginInput, RegisterInput, UpdateMeInput } from "./auth.validation";

export const registerService = async (data: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new AppError("Un utilisateur avec cet email existe déjà", 409);
  }

  const baseSlug = generateSlug(data.companyName);

  const existingCompany = await prisma.company.findUnique({
    where: { slug: baseSlug },
  });

  const finalSlug = existingCompany
    ? `${baseSlug}-${Date.now()}`
    : baseSlug;

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const result = await prisma.$transaction(async (tx) => {
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

  const token = generateToken({
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

export const loginService = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({
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
    throw new AppError("Email ou mot de passe incorrect", 401);
  }

  if (!user.isActive) {
    throw new AppError("Ce compte est désactivé", 403);
  }

  const isPasswordValid = await bcrypt.compare(data.password, user.password);

  if (!isPasswordValid) {
    throw new AppError("Email ou mot de passe incorrect", 401);
  }

  const token = generateToken({
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

export const getMeService = async (userId: string) => {
  const user = await prisma.user.findUnique({
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
    throw new AppError("Utilisateur introuvable", 404);
  }

  return user;
};

export const updateMeService = async (
  userId: string,
  data: UpdateMeInput,
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError("Utilisateur introuvable", 404);
  }

  if (data.email && data.email !== user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError("Un utilisateur avec cet email existe déjà", 409);
    }
  }

  let hashedPassword: string | undefined;

  if (data.newPassword) {
    const isPasswordValid = await bcrypt.compare(
      data.currentPassword as string,
      user.password,
    );

    if (!isPasswordValid) {
      throw new AppError("Le mot de passe actuel est incorrect", 401);
    }

    hashedPassword = await bcrypt.hash(data.newPassword, 10);
  }

  return prisma.user.update({
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