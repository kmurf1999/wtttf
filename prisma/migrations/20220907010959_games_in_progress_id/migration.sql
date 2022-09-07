/*
  Warnings:

  - You are about to drop the column `gameInProgressId` on the `User` table. All the data in the column will be lost.
  - Added the required column `firstPlayerId` to the `GameInProgress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `secondPlayerId` to the `GameInProgress` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT,
    "elo" INTEGER NOT NULL DEFAULT 1000
);
INSERT INTO "new_User" ("elo", "email", "emailVerified", "id", "image", "name") SELECT "elo", "email", "emailVerified", "id", "image", "name" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE TABLE "new_GameInProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firstPlayerId" TEXT NOT NULL,
    "secondPlayerId" TEXT NOT NULL
);
INSERT INTO "new_GameInProgress" ("date", "id") SELECT "date", "id" FROM "GameInProgress";
DROP TABLE "GameInProgress";
ALTER TABLE "new_GameInProgress" RENAME TO "GameInProgress";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
