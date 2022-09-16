/*
  Warnings:

  - You are about to alter the column `loserRating` on the `GameResult` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `winnerRating` on the `GameResult` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `GameResult` MODIFY `loserRating` DOUBLE NOT NULL,
    MODIFY `winnerRating` DOUBLE NOT NULL;
