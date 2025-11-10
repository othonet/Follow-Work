# Follow Work - Sistema de Acompanhamento de Desenvolvimento

Sistema para acompanhamento de desenvolvimento de sistemas, desenvolvido com Node.js, Handlebars, TailwindCSS, PrismaORM e MySQL.

## Funcionalidades

### Área Pública
- Visualização de todos os projetos
- Seleção de projeto para acompanhamento
- Exibição de etapas e atividades com barras de progresso
- Visualização de prazos para cada etapa
- Checkboxes desabilitados mostrando o status de conclusão (somente visualização)

### Área Administrativa
- Autenticação JWT
- CRUD completo de projetos
- CRUD completo de etapas com prazos
- CRUD completo de atividades
- Marcação de atividades como concluídas
- Interface moderna com tema dark

## Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Handlebars** - Template engine
- **TailwindCSS** - Framework CSS (tema dark)
- **PrismaORM** - ORM para banco de dados
- **MySQL** - Banco de dados
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas

## Instalação

1. Clone o repositório ou navegue até a pasta do projeto

2. Instale as dependências:
```bash
npm install
```

3. Configure o arquivo `.env` com suas credenciais do MySQL:
```env
DATABASE_URL="mysql://usuario:senha@localhost:3306/follow_work?schema=public"
JWT_SECRET="sua_chave_secreta_jwt_aqui_altere_em_producao"
PORT=3000
```

4. Gere o cliente Prisma:
```bash
npm run prisma:generate
```

5. Execute as migrações do banco de dados:
```bash
npm run prisma:migrate
```

6. Execute o seed para criar os usuários iniciais e dados de exemplo:
```bash
npm run prisma:seed
```

## Usuários Administrativos Pré-cadastrados

### Othon Felipe
- **Email:** ofbsantos@gmail.com
- **Senha:** admin123456

### Rafael Nobre
- **Email:** rafaelnobreagro@gmail.com
- **Senha:** admin123

## Executando o Sistema

### Modo Desenvolvimento
```bash
npm run dev
```

### Modo Produção
```bash
npm start
```

O sistema estará disponível em `http://localhost:3000`

## Estrutura do Projeto

```
follow-work/
├── config/
│   └── database.js          # Configuração do Prisma
├── controllers/
│   ├── adminController.js   # Controllers da área administrativa
│   └── publicController.js  # Controllers da área pública
├── helpers/
│   └── handlebars.js        # Helpers do Handlebars
├── middleware/
│   └── auth.js              # Middleware de autenticação JWT
├── prisma/
│   ├── schema.prisma        # Schema do Prisma
│   └── seed.js              # Seed para dados iniciais
├── routes/
│   ├── admin.js             # Rotas administrativas
│   └── public.js            # Rotas públicas
├── views/
│   ├── layouts/
│   │   └── main.hbs         # Layout principal
│   ├── admin/               # Views administrativas
│   ├── public/              # Views públicas
│   └── error.hbs            # Página de erro
├── server.js                # Arquivo principal do servidor
└── package.json
```

## Rotas

### Públicas
- `GET /` - Lista de projetos
- `GET /projects/:id` - Detalhes do projeto

### Administrativas (requer autenticação)
- `GET /admin/login` - Página de login
- `POST /admin/login` - Autenticação
- `GET /admin/logout` - Logout
- `GET /admin/projects` - Lista de projetos (admin)
- `GET /admin/projects/new` - Formulário de novo projeto
- `POST /admin/projects` - Criar projeto
- `GET /admin/projects/:id/edit` - Formulário de edição
- `POST /admin/projects/:id` - Atualizar projeto
- `POST /admin/projects/:id/delete` - Deletar projeto
- `GET /admin/projects/:projectId/stages` - Lista de etapas
- `GET /admin/projects/:projectId/stages/new` - Formulário de nova etapa
- `POST /admin/projects/:projectId/stages` - Criar etapa
- `GET /admin/projects/:projectId/stages/:id/edit` - Formulário de edição de etapa
- `POST /admin/projects/:projectId/stages/:id` - Atualizar etapa
- `POST /admin/projects/:projectId/stages/:id/delete` - Deletar etapa
- `GET /admin/projects/:projectId/stages/:stageId/activities` - Lista de atividades
- `GET /admin/projects/:projectId/stages/:stageId/activities/new` - Formulário de nova atividade
- `POST /admin/projects/:projectId/stages/:stageId/activities` - Criar atividade
- `GET /admin/projects/:projectId/stages/:stageId/activities/:id/edit` - Formulário de edição de atividade
- `POST /admin/projects/:projectId/stages/:stageId/activities/:id` - Atualizar atividade
- `POST /admin/projects/:projectId/stages/:stageId/activities/:id/delete` - Deletar atividade
- `POST /admin/activities/:id/toggle` - Alternar status de conclusão da atividade

## Modelos de Dados

### User
- id, name, email, password, createdAt, updatedAt

### Project
- id, name, description, createdAt, updatedAt

### Stage
- id, name, description, deadline, projectId, createdAt, updatedAt

### Activity
- id, name, description, completed, stageId, createdAt, updatedAt

## Desenvolvido com

- Node.js
- Express.js
- Handlebars
- TailwindCSS
- PrismaORM
- MySQL

