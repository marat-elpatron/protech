-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('DELIVERY', 'STOCK', 'PRICE', 'FAQ_ANSWER', 'REVIEW_ANSWER');

-- CreateTable
CREATE TABLE "message" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "message_type" "MessageType" NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
