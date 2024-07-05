/*
  Warnings:

  - Added the required column `userAgent` to the `tokens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tokens" ADD COLUMN     "userAgent" TEXT NOT NULL;
