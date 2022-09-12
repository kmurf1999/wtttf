-- AlterTable
ALTER TABLE `Account` ADD COLUMN `refresh_token_expires_in` INTEGER NULL,
    MODIFY `refresh_token` TEXT NULL,
    MODIFY `access_token` TEXT NULL,
    MODIFY `id_token` TEXT NULL;
