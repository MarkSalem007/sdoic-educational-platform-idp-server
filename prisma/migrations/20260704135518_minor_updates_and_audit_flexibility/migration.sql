/*
  Warnings:

  - The `emailVerified` column on the `userprofile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[mobileNumber]` on the table `userProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[jti]` on the table `userSession` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `method` to the `idempotencyKey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `path` to the `idempotencyKey` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `auditlog` ADD COLUMN `sessionId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `idempotencykey` ADD COLUMN `method` VARCHAR(191) NOT NULL,
    ADD COLUMN `path` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `failedLoginAttempts` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `lastPasswordChangedAt` DATETIME(3) NULL,
    ADD COLUMN `lockedUntil` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `userprofile` DROP COLUMN `emailVerified`,
    ADD COLUMN `emailVerified` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `userrefreshtoken` ADD COLUMN `isRevoked` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `usersession` ADD COLUMN `isRevoked` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `jti` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `userProfile_mobileNumber_key` ON `userProfile`(`mobileNumber`);

-- CreateIndex
CREATE UNIQUE INDEX `userSession_jti_key` ON `userSession`(`jti`);
