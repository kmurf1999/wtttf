/*
  Warnings:

  - Added the required column `loserRating` to the `GameResult` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Account` MODIFY `refresh_token` TEXT NULL,
    MODIFY `access_token` TEXT NULL,
    MODIFY `id_token` TEXT NULL;

-- AlterTable
ALTER TABLE `GameResult` ADD COLUMN `loserRating` INTEGER NOT NULL;
