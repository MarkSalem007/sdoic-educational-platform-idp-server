/*
  Warnings:

  - The values [INACTIVE] on the enum `User_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `auditlog` MODIFY `action` ENUM('REGISTER', 'LOGIN', 'LOGOUT', 'REFRESH_TOKEN', 'CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'CHANGE_PASSWORD', 'FORGOT_PASSWORD', 'RESET_PASSWORD', 'VERIFY_EMAIL') NOT NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `status` ENUM('ACTIVE', 'PENDING', 'DISABLED', 'SUSPENDED', 'TERMINATED') NOT NULL DEFAULT 'PENDING';
