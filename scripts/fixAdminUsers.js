const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Verificando e atualizando usuários administrativos...');

  const adminUsers = [
    {
      name: 'Othon Felipe',
      email: 'ofbsantos@gmail.com',
      password: 'admin123'
    },
    {
      name: 'Rafael Nobre',
      email: 'rafaelnobreagro@gmail.com',
      password: 'admin123'
    }
  ];

  for (const adminUser of adminUsers) {
    try {
      // Verificar se o usuário existe
      const existingUser = await prisma.user.findUnique({
        where: { email: adminUser.email }
      });

      const hashedPassword = await bcrypt.hash(adminUser.password, 10);

      if (existingUser) {
        // Atualizar usuário existente
        await prisma.user.update({
          where: { email: adminUser.email },
          data: {
            name: adminUser.name,
            password: hashedPassword,
            role: 'admin'
          }
        });
        console.log(`✓ Usuário ${adminUser.email} atualizado`);
      } else {
        // Criar novo usuário
        await prisma.user.create({
          data: {
            name: adminUser.name,
            email: adminUser.email,
            password: hashedPassword,
            role: 'admin'
          }
        });
        console.log(`✓ Usuário ${adminUser.email} criado`);
      }
    } catch (error) {
      console.error(`✗ Erro ao processar ${adminUser.email}:`, error.message);
    }
  }

  console.log('\nVerificando usuários no banco:');
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  });

  allUsers.forEach(user => {
    console.log(`- ${user.name} (${user.email}): role = ${user.role || 'undefined'}`);
  });

  console.log('\nConcluído!');
}

main()
  .catch((e) => {
    console.error('Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

