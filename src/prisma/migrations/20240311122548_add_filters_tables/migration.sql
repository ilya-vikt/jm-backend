-- CreateEnum
CREATE TYPE "FilterType" AS ENUM ('STRING', 'LIST', 'MULTILIST', 'NUMBER', 'BOOLEAN');

-- AlterTable
ALTER TABLE "Categories" ADD COLUMN     "filtersId" INTEGER;

-- CreateTable
CREATE TABLE "Filters" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "caption" TEXT NOT NULL DEFAULT '',
    "type" "FilterType" NOT NULL,
    "meta" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Filters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FiltersValues" (
    "id" SERIAL NOT NULL,
    "filter_id" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FiltersValues_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Filters_name_key" ON "Filters"("name");

-- AddForeignKey
ALTER TABLE "Categories" ADD CONSTRAINT "Categories_filtersId_fkey" FOREIGN KEY ("filtersId") REFERENCES "Filters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FiltersValues" ADD CONSTRAINT "FiltersValues_filter_id_fkey" FOREIGN KEY ("filter_id") REFERENCES "Filters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
