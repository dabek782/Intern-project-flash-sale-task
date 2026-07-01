/*
  Warnings:

  - You are about to drop the column `userId` on the `ticket` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ticket" DROP CONSTRAINT "ticket_userId_fkey";

-- AlterTable
ALTER TABLE "ticket" DROP COLUMN "userId";
