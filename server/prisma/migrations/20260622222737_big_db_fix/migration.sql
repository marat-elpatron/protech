/*
  Warnings:

  - You are about to drop the column `payment_method` on the `payment` table. All the data in the column will be lost.
  - Made the column `unit` on table `attribute` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `payment_method` to the `order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "attribute" ALTER COLUMN "unit" SET NOT NULL,
ALTER COLUMN "unit" SET DEFAULT '';

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "payment_method" "PaymentMethod" NOT NULL;

-- AlterTable
ALTER TABLE "payment" DROP COLUMN "payment_method";
