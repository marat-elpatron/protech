/*
  Warnings:

  - A unique constraint covering the columns `[transaction_id]` on the table `payment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentStatus" ADD VALUE 'PENDING';
ALTER TYPE "PaymentStatus" ADD VALUE 'CANCELLED';

-- CreateIndex
CREATE UNIQUE INDEX "payment_transaction_id_key" ON "payment"("transaction_id");
