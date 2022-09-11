-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GameResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "winnerId" TEXT NOT NULL,
    "winnerScore" INTEGER,
    "loserId" TEXT NOT NULL,
    "loserScore" INTEGER,
    CONSTRAINT "GameResult_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GameResult_loserId_fkey" FOREIGN KEY ("loserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_GameResult" ("date", "id", "loserId", "loserScore", "winnerId", "winnerScore") SELECT "date", "id", "loserId", "loserScore", "winnerId", "winnerScore" FROM "GameResult";
DROP TABLE "GameResult";
ALTER TABLE "new_GameResult" RENAME TO "GameResult";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
