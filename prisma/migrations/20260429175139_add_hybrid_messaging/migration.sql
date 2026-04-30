-- CreateEnum
CREATE TYPE "MessagingProvider" AS ENUM ('META', 'TWILIO', 'MOCK');

-- CreateEnum
CREATE TYPE "MessagingAccountScope" AS ENUM ('PLATFORM', 'COMPANY');

-- CreateEnum
CREATE TYPE "MessageDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'RECEIVED');

-- CreateTable
CREATE TABLE "MessagingAccount" (
    "id" TEXT NOT NULL,
    "scope" "MessagingAccountScope" NOT NULL DEFAULT 'COMPANY',
    "companyId" TEXT,
    "provider" "MessagingProvider" NOT NULL DEFAULT 'META',
    "name" TEXT NOT NULL,
    "phoneNumberId" TEXT,
    "businessAccountId" TEXT,
    "accessToken" TEXT,
    "webhookVerifyToken" TEXT,
    "fromPhoneNumber" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessagingAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageLog" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "messagingAccountId" TEXT,
    "campaignId" TEXT,
    "contactId" TEXT,
    "recipientId" TEXT,
    "direction" "MessageDirection" NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'PENDING',
    "provider" "MessagingProvider" NOT NULL,
    "waMessageId" TEXT,
    "fromPhone" TEXT,
    "toPhone" TEXT,
    "body" TEXT,
    "payload" JSONB,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MessagingAccount_companyId_idx" ON "MessagingAccount"("companyId");

-- CreateIndex
CREATE INDEX "MessagingAccount_scope_idx" ON "MessagingAccount"("scope");

-- AddForeignKey
ALTER TABLE "MessagingAccount" ADD CONSTRAINT "MessagingAccount_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageLog" ADD CONSTRAINT "MessageLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageLog" ADD CONSTRAINT "MessageLog_messagingAccountId_fkey" FOREIGN KEY ("messagingAccountId") REFERENCES "MessagingAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageLog" ADD CONSTRAINT "MessageLog_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageLog" ADD CONSTRAINT "MessageLog_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageLog" ADD CONSTRAINT "MessageLog_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "CampaignRecipient"("id") ON DELETE SET NULL ON UPDATE CASCADE;
