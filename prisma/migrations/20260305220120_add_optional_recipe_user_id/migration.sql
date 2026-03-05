-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN "userId" TEXT;

-- CreateIndex
CREATE INDEX "Recipe_userId_idx" ON "Recipe"("userId");
