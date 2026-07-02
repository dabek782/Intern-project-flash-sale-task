/*
  Warnings:

  - You are about to drop the column `timezone` on the `events` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ownerId]` on the table `company` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ownerId` to the `company` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "company" DROP CONSTRAINT "company_createdBy_fkey";

-- DropIndex
DROP INDEX "company_email_key";

-- AlterTable
ALTER TABLE "company" ADD COLUMN     "ownerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "events" DROP COLUMN "timezone";

-- CreateIndex
CREATE UNIQUE INDEX "company_ownerId_key" ON "company"("ownerId");

-- AddForeignKey
ALTER TABLE "company" ADD CONSTRAINT "company_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
