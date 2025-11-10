const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log('Usuários encontrados:');
    users.forEach(user => {
      console.log(`- ${user.email}: role = ${user.role || 'undefined'}`);
    });
  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();

