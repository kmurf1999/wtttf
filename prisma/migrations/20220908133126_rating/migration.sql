/*
  Warnings:

  - You are about to drop the `Example` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `elo` on the `User` table. All the data in the column will be lost.
  - Added the required column `loserScore` to the `GameResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `winnerScore` to the `GameResult` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Example";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GameResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "winnerId" TEXT NOT NULL,
    "winnerScore" INTEGER NOT NULL,
    "loserId" TEXT NOT NULL,
    "loserScore" INTEGER NOT NULL,
    CONSTRAINT "GameResult_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GameResult_loserId_fkey" FOREIGN KEY ("loserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_GameResult" ("id", "loserId", "winnerId") SELECT "id", "loserId", "winnerId" FROM "GameResult";
DROP TABLE "GameResult";
ALTER TABLE "new_GameResult" RENAME TO "GameResult";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT,
    "rating" REAL NOT NULL DEFAULT 1000,
    "gameInProgressId" TEXT,
    CONSTRAINT "User_gameInProgressId_fkey" FOREIGN KEY ("gameInProgressId") REFERENCES "GameInProgress" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("email", "emailVerified", "gameInProgressId", "id", "image", "name") SELECT "email", "emailVerified", "gameInProgressId", "id", "image", "name" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
