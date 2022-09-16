/*
  Warnings:

  - Added the required column `winnerRating` to the `GameResult` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `GameResult` ADD COLUMN `winnerRating` INTEGER NOT NULL;
