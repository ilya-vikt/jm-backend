-- CreateTable
CREATE TABLE "Products" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "marketing_price" DOUBLE PRECISION,
    "thumb_id" TEXT NOT NULL,
    "gallery" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductsFiltersValues" (
    "product_id" INTEGER NOT NULL,
    "filter_id" INTEGER NOT NULL,
    "value" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductsFiltersValues_product_id_filter_id_key" ON "ProductsFiltersValues"("product_id", "filter_id");

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_thumb_id_fkey" FOREIGN KEY ("thumb_id") REFERENCES "MediaLibrary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductsFiltersValues" ADD CONSTRAINT "ProductsFiltersValues_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductsFiltersValues" ADD CONSTRAINT "ProductsFiltersValues_filter_id_fkey" FOREIGN KEY ("filter_id") REFERENCES "Filters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
