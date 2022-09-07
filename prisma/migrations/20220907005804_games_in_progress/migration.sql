-- CreateTable
CREATE TABLE "GameInProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "GameResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "winnerId" TEXT NOT NULL,
    "loserId" TEXT NOT NULL,
    CONSTRAINT "GameResult_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GameResult_loserId_fkey" FOREIGN KEY ("loserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
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
CREATE TABLE "new_GameInvite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    CONSTRAINT "GameInvite_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GameInvite_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_GameInvite" ("fromUserId", "id", "toUserId") SELECT "fromUserId", "id", "toUserId" FROM "GameInvite";
DROP TABLE "GameInvite";
ALTER TABLE "new_GameInvite" RENAME TO "GameInvite";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
