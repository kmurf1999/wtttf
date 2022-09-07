/*
  Warnings:

  - You are about to drop the column `firstPlayerId` on the `GameInProgress` table. All the data in the column will be lost.
  - You are about to drop the column `secondPlayerId` on the `GameInProgress` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GameInProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_GameInProgress" ("date", "id") SELECT "date", "id" FROM "GameInProgress";
DROP TABLE "GameInProgress";
ALTER TABLE "new_GameInProgress" RENAME TO "GameInProgress";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT,
    "elo" INTEGER NOT NULL DEFAULT 1000,
    "gameInProgressId" TEXT,
    CONSTRAINT "User_gameInProgressId_fkey" FOREIGN KEY ("gameInProgressId") REFERENCES "GameInProgress" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("elo", "email", "emailVerified", "id", "image", "name") SELECT "elo", "email", "emailVerified", "id", "image", "name" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
