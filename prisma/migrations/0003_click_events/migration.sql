CREATE TABLE "ClickEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "targetType" TEXT NOT NULL,
    "linkType" TEXT NOT NULL,
    "toolSlug" TEXT,
    "toolName" TEXT,
    "categorySlug" TEXT,
    "sponsorId" TEXT,
    "sponsorTitle" TEXT,
    "sponsorPosition" TEXT,
    "sponsorCategory" TEXT,
    "targetUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "ClickEvent_createdAt_idx" ON "ClickEvent"("createdAt");
CREATE INDEX "ClickEvent_targetType_createdAt_idx" ON "ClickEvent"("targetType", "createdAt");
CREATE INDEX "ClickEvent_toolSlug_createdAt_idx" ON "ClickEvent"("toolSlug", "createdAt");
CREATE INDEX "ClickEvent_sponsorId_createdAt_idx" ON "ClickEvent"("sponsorId", "createdAt");
