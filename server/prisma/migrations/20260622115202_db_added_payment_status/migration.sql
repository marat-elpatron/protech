/*
  Warnings:

  - Added the required column `payment_status` to the `payment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UPON_RECEIPT', 'PAID');

-- AlterTable
ALTER TABLE "payment" ADD COLUMN     "payment_status" "PaymentStatus" NOT NULL;
