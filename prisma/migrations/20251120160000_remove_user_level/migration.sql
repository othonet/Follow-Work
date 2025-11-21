-- AlterTable
-- Remover coluna userLevel (se existir)
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_SCHEMA = DATABASE() 
               AND TABLE_NAME = 'User' 
               AND COLUMN_NAME = 'userLevel');
SET @sqlstmt := IF(@exist > 0, 'ALTER TABLE `User` DROP COLUMN `userLevel`', 'SELECT 1');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;




