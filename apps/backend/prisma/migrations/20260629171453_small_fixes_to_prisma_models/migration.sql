/*
  Warnings:

  - Added the required column `updatedAt` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedBy" VARCHAR(50) NOT NULL DEFAULT 'system',
ALTER COLUMN "password" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "createdBy" SET DEFAULT 'system';
