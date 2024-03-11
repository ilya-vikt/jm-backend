/*
  Warnings:

  - The values [STRING] on the enum `FilterType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FilterType_new" AS ENUM ('LIST', 'MULTILIST', 'NUMBER', 'BOOLEAN');
ALTER TABLE "Filters" ALTER COLUMN "type" TYPE "FilterType_new" USING ("type"::text::"FilterType_new");
ALTER TYPE "FilterType" RENAME TO "FilterType_old";
ALTER TYPE "FilterType_new" RENAME TO "FilterType";
DROP TYPE "FilterType_old";
COMMIT;
