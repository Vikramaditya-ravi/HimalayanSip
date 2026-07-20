-- CreateEnum
CREATE TYPE "Actor" AS ENUM ('visitor', 'customer', 'admin', 'system');

-- CreateEnum
CREATE TYPE "EventSource" AS ENUM ('web', 'server', 'admin', 'api');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('new', 'contacted', 'on_hold', 'won', 'lost', 'dispatched');

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "occurredAt" TIMESTAMPTZ(3) NOT NULL,
    "receivedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visitorId" TEXT,
    "sessionId" TEXT,
    "actor" "Actor" NOT NULL DEFAULT 'visitor',
    "actorId" TEXT,
    "leadId" TEXT,
    "productSku" TEXT,
    "industrySlug" TEXT,
    "sectionId" TEXT,
    "queryText" TEXT,
    "source" "EventSource" NOT NULL DEFAULT 'web',
    "pageUrl" TEXT,
    "prevPage" TEXT,
    "referrer" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "country" TEXT,
    "city" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,
    "gclid" TEXT,
    "fbclid" TEXT,
    "msclkid" TEXT,
    "consent" BOOLEAN NOT NULL DEFAULT false,
    "props" JSONB,
    "forwardedAt" TIMESTAMPTZ(3),

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "quantity" TEXT,
    "message" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'new',
    "value" DECIMAL(12,2),
    "visitorId" TEXT,
    "sessionId" TEXT,
    "firstSource" TEXT,
    "firstMedium" TEXT,
    "firstCampaign" TEXT,
    "firstReferrer" TEXT,
    "landingPage" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "contactedAt" TIMESTAMPTZ(3),
    "closedAt" TIMESTAMPTZ(3),

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventDaily" (
    "day" DATE NOT NULL,
    "name" TEXT NOT NULL,
    "events" INTEGER NOT NULL DEFAULT 0,
    "visitors" INTEGER NOT NULL DEFAULT 0,
    "sessions" INTEGER NOT NULL DEFAULT 0,
    "bounced" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EventDaily_pkey" PRIMARY KEY ("day","name")
);

-- CreateTable
CREATE TABLE "DimensionDaily" (
    "day" DATE NOT NULL,
    "dimension" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "sessions" INTEGER NOT NULL DEFAULT 0,
    "events" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DimensionDaily_pkey" PRIMARY KEY ("day","dimension","value")
);

-- CreateTable
CREATE TABLE "ProductDaily" (
    "day" DATE NOT NULL,
    "productSku" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "ctaClicks" INTEGER NOT NULL DEFAULT 0,
    "sessions" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductDaily_pkey" PRIMARY KEY ("day","productSku")
);

-- CreateTable
CREATE TABLE "SourceDaily" (
    "day" DATE NOT NULL,
    "source" TEXT NOT NULL,
    "medium" TEXT NOT NULL DEFAULT '',
    "campaign" TEXT NOT NULL DEFAULT '',
    "sessions" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "revenue" DECIMAL(14,2) NOT NULL DEFAULT 0,

    CONSTRAINT "SourceDaily_pkey" PRIMARY KEY ("day","source","medium","campaign")
);

-- CreateTable
CREATE TABLE "SearchDaily" (
    "day" DATE NOT NULL,
    "query" TEXT NOT NULL,
    "searches" INTEGER NOT NULL DEFAULT 0,
    "zeroResults" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SearchDaily_pkey" PRIMARY KEY ("day","query")
);

-- CreateTable
CREATE TABLE "Insight" (
    "id" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "detector" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "metric" JSONB NOT NULL,
    "narrative" TEXT,
    "notifiedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Insight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Event_name_occurredAt_idx" ON "Event"("name", "occurredAt");

-- CreateIndex
CREATE INDEX "Event_occurredAt_idx" ON "Event"("occurredAt");

-- CreateIndex
CREATE INDEX "Event_visitorId_occurredAt_idx" ON "Event"("visitorId", "occurredAt");

-- CreateIndex
CREATE INDEX "Event_sessionId_occurredAt_idx" ON "Event"("sessionId", "occurredAt");

-- CreateIndex
CREATE INDEX "Event_leadId_idx" ON "Event"("leadId");

-- CreateIndex
CREATE INDEX "Event_productSku_occurredAt_idx" ON "Event"("productSku", "occurredAt");

-- CreateIndex
CREATE INDEX "Event_industrySlug_occurredAt_idx" ON "Event"("industrySlug", "occurredAt");

-- CreateIndex
CREATE INDEX "Event_queryText_idx" ON "Event"("queryText");

-- CreateIndex
CREATE INDEX "Event_forwardedAt_idx" ON "Event"("forwardedAt");

-- CreateIndex
CREATE INDEX "Lead_status_createdAt_idx" ON "Lead"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Lead_visitorId_idx" ON "Lead"("visitorId");

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

-- CreateIndex
CREATE INDEX "EventDaily_day_idx" ON "EventDaily"("day");

-- CreateIndex
CREATE INDEX "DimensionDaily_day_dimension_idx" ON "DimensionDaily"("day", "dimension");

-- CreateIndex
CREATE INDEX "ProductDaily_day_idx" ON "ProductDaily"("day");

-- CreateIndex
CREATE INDEX "SourceDaily_day_idx" ON "SourceDaily"("day");

-- CreateIndex
CREATE INDEX "SearchDaily_day_idx" ON "SearchDaily"("day");

-- CreateIndex
CREATE INDEX "SearchDaily_zeroResults_idx" ON "SearchDaily"("zeroResults");

-- CreateIndex
CREATE INDEX "Insight_day_idx" ON "Insight"("day");

-- CreateIndex
CREATE UNIQUE INDEX "Insight_day_detector_key" ON "Insight"("day", "detector");

