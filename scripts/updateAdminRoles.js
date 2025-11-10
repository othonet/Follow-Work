const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Atualizando roles dos usuários administrativos...');

  // Lista de emails de administradores
  const adminEmails = ['ofbsantos@gmail.com', 'rafaelnobreagro@gmail.com'];

  for (const email of adminEmails) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'admin' }
      });
      console.log(`✓ Usuário ${email} atualizado para admin`);
    } else {
      console.log(`✗ Usuário ${email} não encontrado`);
    }
  }

  console.log('Atualização concluída!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

