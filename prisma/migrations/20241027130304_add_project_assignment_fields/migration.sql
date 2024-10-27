-- AlterTable
ALTER TABLE `Project` ADD COLUMN `engineerId` INTEGER NULL,
    ADD COLUMN `projectManagerId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `Project_projectManagerId_idx` ON `Project`(`projectManagerId`);

-- CreateIndex
CREATE INDEX `Project_engineerId_idx` ON `Project`(`engineerId`);

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_projectManagerId_fkey` FOREIGN KEY (`projectManagerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_engineerId_fkey` FOREIGN KEY (`engineerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
