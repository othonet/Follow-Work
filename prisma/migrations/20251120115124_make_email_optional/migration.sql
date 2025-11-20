-- AlterTable
-- Adicionar coluna username (pode falhar se já existir, mas isso é esperado)
ALTER TABLE `User` ADD COLUMN `username` VARCHAR(191) NULL;

-- Criar índice único para username (pode falhar se já existir, mas isso é esperado)
CREATE UNIQUE INDEX `User_username_key` ON `User`(`username`);

-- AlterTable
-- Tornar email nullable (opcional)
ALTER TABLE `User` MODIFY COLUMN `email` VARCHAR(191) NULL;

