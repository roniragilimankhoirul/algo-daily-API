-- CreateTable
CREATE TABLE `attendances` (
    `id` VARCHAR(100) NOT NULL,
    `attended` BOOLEAN NOT NULL,
    `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `latitude` DOUBLE NOT NULL,
    `longitude` DOUBLE NOT NULL,
    `reason` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_attendances` (
    `user_id` VARCHAR(100) NOT NULL,
    `attendance_id` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`user_id`, `attendance_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_attendances` ADD CONSTRAINT `user_attendances_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_attendances` ADD CONSTRAINT `user_attendances_attendance_id_fkey` FOREIGN KEY (`attendance_id`) REFERENCES `attendances`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
