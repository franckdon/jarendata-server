-- CreateEnum
CREATE TYPE "CompanyMemberRole" AS ENUM ('OWNER', 'MANAGER', 'ANALYST', 'MEMBER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "companyRole" "CompanyMemberRole";
