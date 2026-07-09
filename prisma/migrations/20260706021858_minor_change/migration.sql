/*
  Warnings:

  - The values [LOCKED] on the enum `User_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `user` MODIFY `status` ENUM('ACTIVE', 'INACTIVE', 'PENDING', 'DISABLED', 'SUSPENDED', 'TERMINATED') NOT NULL DEFAULT 'PENDING';
