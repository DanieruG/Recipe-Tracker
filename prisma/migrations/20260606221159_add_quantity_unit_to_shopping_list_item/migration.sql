/*
  Warnings:

  - You are about to drop the column `quantity` on the `Ingredient` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `Ingredient` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RecipeIngredient" ADD COLUMN "quantity" INTEGER;
ALTER TABLE "RecipeIngredient" ADD COLUMN "unit" TEXT;

-- AlterTable
ALTER TABLE "ShoppingListItem" ADD COLUMN "quantity" INTEGER;
ALTER TABLE "ShoppingListItem" ADD COLUMN "unit" INTEGER;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ingredient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);
INSERT INTO "new_Ingredient" ("id", "name") SELECT "id", "name" FROM "Ingredient";
DROP TABLE "Ingredient";
ALTER TABLE "new_Ingredient" RENAME TO "Ingredient";
CREATE UNIQUE INDEX "Ingredient_name_key" ON "Ingredient"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
