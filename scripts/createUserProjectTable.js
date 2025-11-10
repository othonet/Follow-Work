const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Criando tabela user_projects...');

  try {
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS \`user_projects\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`userId\` INT NOT NULL,
        \`projectId\` INT NOT NULL,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`user_projects_userId_projectId_key\` (\`userId\`, \`projectId\`),
        CONSTRAINT \`user_projects_userId_fkey\` FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`user_projects_projectId_fkey\` FOREIGN KEY (\`projectId\`) REFERENCES \`projects\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `;
    console.log('✓ Tabela user_projects criada com sucesso!');
  } catch (error) {
    if (error.message.includes('already exists') || error.code === 'P2010') {
      console.log('✓ Tabela user_projects já existe');
    } else {
      throw error;
    }
  }
}

main()
  .catch((e) => {
    console.error('Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

