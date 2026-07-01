/*
  Warnings:

  - You are about to drop the column `password` on the `company` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `company` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "company" DROP COLUMN "password",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedBy" VARCHAR(50) NOT NULL DEFAULT 'system',
ALTER COLUMN "createdBy" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "company" ADD CONSTRAINT "company_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
