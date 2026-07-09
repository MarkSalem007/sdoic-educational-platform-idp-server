/*
  Warnings:

  - Made the column `isRevoked` on table `userrefreshtoken` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `userrefreshtoken` MODIFY `isRevoked` BOOLEAN NOT NULL DEFAULT false;
