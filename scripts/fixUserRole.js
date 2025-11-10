const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Adicionando coluna role e atualizando usuários...');

  try {
    // Adicionar coluna role (usando SQL direto)
    await prisma.$executeRaw`
      ALTER TABLE \`User\` 
      ADD COLUMN \`role\` VARCHAR(191) NOT NULL DEFAULT 'cliente'
    `;
    console.log('✓ Coluna role adicionada');
  } catch (error) {
    // Se a coluna já existe, continuar
    if (error.message.includes('Duplicate column name') || error.code === 'P2010') {
      console.log('✓ Coluna role já existe');
    } else {
      throw error;
    }
  }

  // Atualizar usuários administrativos
  const adminEmails = ['ofbsantos@gmail.com', 'rafaelnobreagro@gmail.com'];
  
  for (const email of adminEmails) {
    try {
      await prisma.$executeRaw`
        UPDATE \`User\` 
        SET \`role\` = 'admin' 
        WHERE \`email\` = ${email}
      `;
      console.log(`✓ Usuário ${email} atualizado para admin`);
    } catch (error) {
      console.log(`✗ Erro ao atualizar ${email}:`, error.message);
    }
  }

  console.log('Atualização concluída!');
}

main()
  .catch((e) => {
    console.error('Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

