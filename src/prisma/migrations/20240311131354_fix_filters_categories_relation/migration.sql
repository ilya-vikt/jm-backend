/*
  Warnings:

  - You are about to drop the column `filtersId` on the `Categories` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Categories" DROP CONSTRAINT "Categories_filtersId_fkey";

-- AlterTable
ALTER TABLE "Categories" DROP COLUMN "filtersId";

-- CreateTable
CREATE TABLE "_CategoriesToFilters" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CategoriesToFilters_AB_unique" ON "_CategoriesToFilters"("A", "B");

-- CreateIndex
CREATE INDEX "_CategoriesToFilters_B_index" ON "_CategoriesToFilters"("B");

-- AddForeignKey
ALTER TABLE "_CategoriesToFilters" ADD CONSTRAINT "_CategoriesToFilters_A_fkey" FOREIGN KEY ("A") REFERENCES "Categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoriesToFilters" ADD CONSTRAINT "_CategoriesToFilters_B_fkey" FOREIGN KEY ("B") REFERENCES "Filters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
