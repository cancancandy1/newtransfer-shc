/*
  Warnings:

  - You are about to drop the column `full_name` on the `registrations` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `registrations` table. All the data in the column will be lost.
  - You are about to drop the column `user_code` on the `registrations` table. All the data in the column will be lost.
  - You are about to drop the column `full_name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `user_code` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `registrations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `registrations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tel` to the `registrations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tel` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `users_user_code_key` ON `users`;

-- AlterTable
ALTER TABLE `registrations` RENAME COLUMN `full_name` TO `name`,
    RENAME COLUMN `phone` TO `tel`,
    RENAME COLUMN `user_code` TO `code`,
    ADD COLUMN `email` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `users` RENAME COLUMN `full_name` TO `name`,
    RENAME COLUMN `phone` TO `tel`,
    RENAME COLUMN `user_code` TO `code`,
    ADD COLUMN `email` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `users_code_key` ON `users`(`code`);
