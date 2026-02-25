-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Opportunity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contributorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "brief" TEXT NOT NULL,
    "company" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'general',
    "validationChecklist" TEXT NOT NULL DEFAULT '',
    "requirements" TEXT NOT NULL DEFAULT '',
    "highLevelApproach" TEXT NOT NULL DEFAULT '',
    "stage1Price" INTEGER NOT NULL DEFAULT 250,
    "fullPlaybook" TEXT NOT NULL DEFAULT '',
    "templates" TEXT NOT NULL DEFAULT '',
    "stage2Price" INTEGER NOT NULL DEFAULT 0,
    "savingsEstimateLow" INTEGER NOT NULL DEFAULT 0,
    "savingsEstimateHigh" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "confidenceScore" REAL NOT NULL DEFAULT 0,
    "duplicateOfId" TEXT,
    "piiDetected" BOOLEAN NOT NULL DEFAULT false,
    "flagReason" TEXT,
    "submittedViaApi" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Opportunity_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Opportunity" ("brief", "category", "confidenceScore", "contributorId", "createdAt", "duplicateOfId", "flagReason", "fullPlaybook", "highLevelApproach", "id", "piiDetected", "requirements", "savingsEstimateHigh", "savingsEstimateLow", "stage1Price", "stage2Price", "status", "submittedViaApi", "templates", "title", "updatedAt", "validationChecklist") SELECT "brief", "category", "confidenceScore", "contributorId", "createdAt", "duplicateOfId", "flagReason", "fullPlaybook", "highLevelApproach", "id", "piiDetected", "requirements", "savingsEstimateHigh", "savingsEstimateLow", "stage1Price", "stage2Price", "status", "submittedViaApi", "templates", "title", "updatedAt", "validationChecklist" FROM "Opportunity";
DROP TABLE "Opportunity";
ALTER TABLE "new_Opportunity" RENAME TO "Opportunity";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
