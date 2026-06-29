ALTER TABLE "order" ADD COLUMN "stock_reserved" BOOLEAN NOT NULL DEFAULT false;

UPDATE "order" AS o
SET "stock_reserved" = true
WHERE o."order_status" <> 'CANCELLED'
  AND (
    o."payment_method" = 'OFFLINE'
    OR EXISTS (
      SELECT 1
      FROM "payment" AS p
      WHERE p."order_id" = o."id"
        AND p."payment_status" = 'PAID'
    )
  );
