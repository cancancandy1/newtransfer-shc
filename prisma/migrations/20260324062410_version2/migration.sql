/*
  Warnings:

  - You are about to drop the column `service_rate` on the `member_types` table. All the data in the column will be lost.
  - You are about to drop the column `member_type_id` on the `registrations` table. All the data in the column will be lost.
  - Added the required column `firstname` to the `admins` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastname` to the `admins` table without a default value. This is not possible if the table is not empty.
  - Added the required column `member_sub_type_id` to the `registrations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `member_sub_type_name` to the `registrations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `registrations` DROP FOREIGN KEY `registrations_member_type_id_fkey`;

-- DropIndex
DROP INDEX `registrations_member_type_id_fkey` ON `registrations`;

-- AlterTable
ALTER TABLE `admins` ADD COLUMN `firstname` VARCHAR(191) NOT NULL,
    ADD COLUMN `lastname` VARCHAR(191) NOT NULL,
    ADD COLUMN `role` ENUM('ADMIN', 'STAFF') NOT NULL DEFAULT 'STAFF';

-- AlterTable
ALTER TABLE `member_types` DROP COLUMN `service_rate`;

-- AlterTable
ALTER TABLE `registrations` DROP COLUMN `member_type_id`,
    ADD COLUMN `deleted_at` DATETIME(3) NULL,
    ADD COLUMN `member_sub_type_id` INTEGER NOT NULL,
    ADD COLUMN `member_sub_type_name` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `member_sub_types` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `member_type_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `service_rate` DECIMAL(10, 2) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `member_sub_types` ADD CONSTRAINT `member_sub_types_member_type_id_fkey` FOREIGN KEY (`member_type_id`) REFERENCES `member_types`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registrations` ADD CONSTRAINT `registrations_member_sub_type_id_fkey` FOREIGN KEY (`member_sub_type_id`) REFERENCES `member_sub_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
