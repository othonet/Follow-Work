-- AlterTable
-- Adicionar coluna order na tabela activities
ALTER TABLE `activities` ADD COLUMN `order` INT NOT NULL DEFAULT 0;

-- Atualizar valores existentes com base no createdAt
UPDATE `activities` a1
SET `order` = (
    SELECT COUNT(*) 
    FROM `activities` a2 
    WHERE a2.`stageId` = a1.`stageId` 
    AND (a2.`createdAt` < a1.`createdAt` OR (a2.`createdAt` = a1.`createdAt` AND a2.`id` < a1.`id`))
);

