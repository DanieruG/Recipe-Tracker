-- AlterTable
ALTER TABLE "Schedule" ADD COLUMN "userId" TEXT;

-- AlterTable
ALTER TABLE "ShoppingList" ADD COLUMN "userId" TEXT;

-- CreateIndex
CREATE INDEX "Schedule_userId_idx" ON "Schedule"("userId");

-- CreateIndex
CREATE INDEX "ShoppingList_userId_idx" ON "ShoppingList"("userId");
