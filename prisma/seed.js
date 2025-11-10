const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed...');

  // Criar usuários
  const password1 = await bcrypt.hash('admin123', 10);
  const password2 = await bcrypt.hash('admin123', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'ofbsantos@gmail.com' },
    update: {
      name: 'Othon Felipe',
      password: password1,
      role: 'admin',
    },
    create: {
      name: 'Othon Felipe',
      email: 'ofbsantos@gmail.com',
      password: password1,
      role: 'admin',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'rafaelnobreagro@gmail.com' },
    update: {
      name: 'Rafael Nobre',
      password: password2,
      role: 'admin',
    },
    create: {
      name: 'Rafael Nobre',
      email: 'rafaelnobreagro@gmail.com',
      password: password2,
      role: 'admin',
    },
  });

  console.log('Usuários criados:', { user1, user2 });

  // Criar projeto de exemplo
  const project = await prisma.project.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Sistema de Gestão',
      description: 'Sistema completo de gestão empresarial',
      stages: {
        create: [
          {
            name: 'Planejamento',
            description: 'Fase de planejamento e definição de requisitos',
            deadline: new Date('2024-02-15'),
            activities: {
              create: [
                { name: 'Levantamento de requisitos', completed: true },
                { name: 'Definição de escopo', completed: true },
                { name: 'Criação de documentação inicial', completed: false },
              ],
            },
          },
          {
            name: 'Desenvolvimento',
            description: 'Fase de desenvolvimento do sistema',
            deadline: new Date('2024-03-30'),
            activities: {
              create: [
                { name: 'Configuração do ambiente', completed: true },
                { name: 'Desenvolvimento do backend', completed: false },
                { name: 'Desenvolvimento do frontend', completed: false },
                { name: 'Integração de APIs', completed: false },
              ],
            },
          },
          {
            name: 'Testes',
            description: 'Fase de testes e validação',
            deadline: new Date('2024-04-15'),
            activities: {
              create: [
                { name: 'Testes unitários', completed: false },
                { name: 'Testes de integração', completed: false },
                { name: 'Testes de aceitação', completed: false },
              ],
            },
          },
        ],
      },
    },
    include: {
      stages: {
        include: {
          activities: true,
        },
      },
    },
  });

  console.log('Projeto de exemplo criado:', project);
  console.log('Seed concluído!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

