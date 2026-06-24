-- AlterTable
ALTER TABLE "review" ADD COLUMN     "is_answered" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "shop_question" ADD COLUMN     "is_answered" BOOLEAN DEFAULT false;
