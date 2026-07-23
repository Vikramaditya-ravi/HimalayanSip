-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('customer', 'bottle_supplier', 'water_plant');

-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('active', 'inactive');

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "type" "ContactType" NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "contactPerson" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "location" TEXT,
    "address" TEXT,
    "supplyQuantity" TEXT,
    "unit" TEXT,
    "rate" DECIMAL(12,2),
    "notes" TEXT,
    "status" "ContactStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Contact_type_createdAt_idx" ON "Contact"("type", "createdAt");

-- CreateIndex
CREATE INDEX "Contact_status_idx" ON "Contact"("status");

