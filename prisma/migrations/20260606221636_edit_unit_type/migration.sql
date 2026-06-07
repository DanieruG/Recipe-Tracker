-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ShoppingListItem" (
    "shoppingListId" INTEGER NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "quantity" INTEGER,
    "unit" TEXT,

    PRIMARY KEY ("shoppingListId", "ingredientId"),
    CONSTRAINT "ShoppingListItem_shoppingListId_fkey" FOREIGN KEY ("shoppingListId") REFERENCES "ShoppingList" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ShoppingListItem_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ShoppingListItem" ("checked", "ingredientId", "quantity", "shoppingListId", "unit") SELECT "checked", "ingredientId", "quantity", "shoppingListId", "unit" FROM "ShoppingListItem";
DROP TABLE "ShoppingListItem";
ALTER TABLE "new_ShoppingListItem" RENAME TO "ShoppingListItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
