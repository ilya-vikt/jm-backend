-- CreateTable
CREATE TABLE "Categories" (
    "id" SERIAL NOT NULL,
    "parent_id" INTEGER NOT NULL,
    "priority" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL DEFAULT '',
    "image_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Categories_priority_idx" ON "Categories"("priority");

-- AddForeignKey
ALTER TABLE "Categories" ADD CONSTRAINT "Categories_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "MediaLibrary"("id") ON DELETE SET NULL ON UPDATE CASCADE;
