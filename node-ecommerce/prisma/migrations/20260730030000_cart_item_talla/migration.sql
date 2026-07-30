-- AlterTable
ALTER TABLE "cart_items" ADD COLUMN IF NOT EXISTS "talla" TEXT NOT NULL DEFAULT 'M';

-- DropIndex
DROP INDEX IF EXISTS "cart_items_cart_id_product_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_cart_id_product_id_talla_key" ON "cart_items"("cart_id", "product_id", "talla");
