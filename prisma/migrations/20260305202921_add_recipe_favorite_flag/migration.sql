-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Recipe" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "mealType" TEXT NOT NULL,
    "effort" TEXT,
    "healthiness" TEXT,
    "instructions" TEXT NOT NULL,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "rating" INTEGER,
    "lastMade" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timesIncluded" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_Recipe" ("effort", "healthiness", "id", "instructions", "lastMade", "mealType", "name", "rating", "timesIncluded") SELECT "effort", "healthiness", "id", "instructions", "lastMade", "mealType", "name", "rating", "timesIncluded" FROM "Recipe";
DROP TABLE "Recipe";
ALTER TABLE "new_Recipe" RENAME TO "Recipe";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
