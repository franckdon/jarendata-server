/*
  Warnings:

  - A unique constraint covering the columns `[companyId,externalId]` on the table `Contact` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "consentText" TEXT,
ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "optInAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Contact_companyId_externalId_key" ON "Contact"("companyId", "externalId");
