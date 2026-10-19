-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'FARMER',
    "farmerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Farmer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Land" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "areaRai" REAL NOT NULL,
    "soilType" TEXT NOT NULL,
    "soilPh" REAL NOT NULL,
    "waterSystem" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Land_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Crop" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "yieldPerRai" REAL NOT NULL,
    "costPerRai" REAL NOT NULL,
    "pricePerKg" REAL NOT NULL,
    "careLevel" TEXT NOT NULL,
    "cyclesPerYear" INTEGER NOT NULL,
    "isSampleData" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProductionPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "landId" TEXT NOT NULL,
    "cropId" TEXT NOT NULL,
    "areaUsedRai" REAL NOT NULL,
    "subPlots" INTEGER NOT NULL DEFAULT 1,
    "startDate" DATETIME NOT NULL,
    "rounds" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'กำลังดำเนินการ',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProductionPlan_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProductionPlan_landId_fkey" FOREIGN KEY ("landId") REFERENCES "Land" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProductionPlan_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CostBreakdown" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planId" TEXT NOT NULL,
    "costSeed" REAL NOT NULL DEFAULT 0,
    "costFertilizer" REAL NOT NULL DEFAULT 0,
    "costLabor" REAL NOT NULL DEFAULT 0,
    "costWaterElec" REAL NOT NULL DEFAULT 0,
    "costOther" REAL NOT NULL DEFAULT 0,
    "sellablePct" REAL NOT NULL DEFAULT 90.0,
    CONSTRAINT "CostBreakdown_planId_fkey" FOREIGN KEY ("planId") REFERENCES "ProductionPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_farmerId_key" ON "User"("farmerId");

-- CreateIndex
CREATE UNIQUE INDEX "Farmer_code_key" ON "Farmer"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Land_code_key" ON "Land"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Crop_code_key" ON "Crop"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionPlan_code_key" ON "ProductionPlan"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CostBreakdown_planId_key" ON "CostBreakdown"("planId");
