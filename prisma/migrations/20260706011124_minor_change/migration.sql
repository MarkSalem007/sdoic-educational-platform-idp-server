/*
  Warnings:

  - Made the column `isRevoked` on table `usersession` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `usersession` MODIFY `isRevoked` BOOLEAN NOT NULL DEFAULT false;
