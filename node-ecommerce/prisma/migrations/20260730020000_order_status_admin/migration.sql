-- Migrate OrderStatus: cotizado/pagado/despachado/entregado → pendiente/en_proceso/atendido

ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "status" TYPE TEXT USING "status"::TEXT;
ALTER TABLE "order_status_history" ALTER COLUMN "from_status" TYPE TEXT USING "from_status"::TEXT;
ALTER TABLE "order_status_history" ALTER COLUMN "to_status" TYPE TEXT USING "to_status"::TEXT;

UPDATE "orders" SET "status" = CASE
  WHEN "status" = 'cotizado' THEN 'pendiente'
  WHEN "status" IN ('pagado', 'despachado') THEN 'en_proceso'
  WHEN "status" = 'entregado' THEN 'atendido'
  ELSE 'pendiente'
END;

UPDATE "order_status_history" SET "from_status" = CASE
  WHEN "from_status" = 'cotizado' THEN 'pendiente'
  WHEN "from_status" IN ('pagado', 'despachado') THEN 'en_proceso'
  WHEN "from_status" = 'entregado' THEN 'atendido'
  ELSE "from_status"
END;

UPDATE "order_status_history" SET "to_status" = CASE
  WHEN "to_status" = 'cotizado' THEN 'pendiente'
  WHEN "to_status" IN ('pagado', 'despachado') THEN 'en_proceso'
  WHEN "to_status" = 'entregado' THEN 'atendido'
  ELSE "to_status"
END;

DROP TYPE "OrderStatus";

CREATE TYPE "OrderStatus" AS ENUM ('pendiente', 'en_proceso', 'atendido');

ALTER TABLE "orders"
  ALTER COLUMN "status" TYPE "OrderStatus" USING "status"::"OrderStatus";

ALTER TABLE "order_status_history"
  ALTER COLUMN "from_status" TYPE "OrderStatus" USING "from_status"::"OrderStatus";

ALTER TABLE "order_status_history"
  ALTER COLUMN "to_status" TYPE "OrderStatus" USING "to_status"::"OrderStatus";

ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pendiente'::"OrderStatus";
