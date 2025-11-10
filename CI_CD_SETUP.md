# Configuração de CI/CD com GitHub Actions

Este guia explica como configurar o deploy automático do Follow Work na sua VPS usando GitHub Actions.

## Pré-requisitos

1. VPS configurada e acessível via SSH
2. Repositório no GitHub
3. Chave SSH configurada na VPS

## Passo 1: Gerar Chave SSH (se ainda não tiver)

Na sua máquina local:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy
```

Isso criará duas chaves:
- `~/.ssh/github_actions_deploy` (chave privada - será usada no GitHub)
- `~/.ssh/github_actions_deploy.pub` (chave pública - será adicionada na VPS)

## Passo 2: Adicionar Chave Pública na VPS

```bash
# Copiar a chave pública para a VPS
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub usuario@seu-ip-vps

# Ou manualmente:
cat ~/.ssh/github_actions_deploy.pub | ssh usuario@seu-ip-vps "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

## Passo 3: Testar Conexão SSH

```bash
ssh -i ~/.ssh/github_actions_deploy usuario@seu-ip-vps
```

Se conseguir conectar sem senha, está funcionando!

## Passo 4: Configurar Secrets no GitHub

1. Acesse seu repositório no GitHub
2. Vá em **Settings** > **Secrets and variables** > **Actions**
3. Clique em **New repository secret**
4. Adicione os seguintes secrets:

### VPS_HOST
- Nome: `VPS_HOST`
- Valor: IP ou domínio da sua VPS (ex: `123.456.789.0` ou `vps.seudominio.com`)

### VPS_USER
- Nome: `VPS_USER`
- Valor: Usuário SSH da VPS (ex: `root` ou `ubuntu`)

### VPS_SSH_KEY
- Nome: `VPS_SSH_KEY`
- Valor: Conteúdo da chave privada (copie todo o conteúdo de `~/.ssh/github_actions_deploy`)

### VPS_PORT (Opcional)
- Nome: `VPS_PORT`
- Valor: Porta SSH (padrão: `22`)

## Passo 5: Preparar VPS

Na VPS, execute:

```bash
# Criar diretório do projeto (se ainda não existir)
cd ~
git clone https://github.com/othonet/Follow-Work.git
cd Follow-Work

# Instalar dependências
npm install

# Configurar .env
cp ENV_EXAMPLE.txt .env
nano .env  # Configure suas variáveis

# Gerar Prisma Client
npm run prisma:generate

# Executar migrações
npm run prisma:migrate

# Instalar PM2 (se ainda não tiver)
npm install -g pm2

# Iniciar aplicação
pm2 start server.js --name follow-work
pm2 startup
pm2 save
```

## Como Funciona

### Deploy Automático
- Sempre que você fizer `git push` na branch `main`, o GitHub Actions irá:
  1. Conectar na VPS via SSH
  2. Fazer `git pull` do código mais recente
  3. Instalar/atualizar dependências
  4. Gerar Prisma Client
  5. Executar migrações do banco
  6. Reiniciar a aplicação com PM2

### Deploy Manual
- Você também pode acionar o deploy manualmente:
  1. Vá em **Actions** no GitHub
  2. Selecione **Manual Deploy to VPS**
  3. Clique em **Run workflow**

## Verificar Deploy

Após o push, você pode verificar o status do deploy:

1. Vá em **Actions** no GitHub
2. Clique no workflow que está rodando
3. Veja os logs em tempo real

## Troubleshooting

### Erro de conexão SSH
- Verifique se o IP/domínio está correto
- Verifique se a porta SSH está aberta no firewall
- Teste a conexão manualmente: `ssh -i ~/.ssh/github_actions_deploy usuario@ip`

### Erro de permissão
- Verifique se a chave pública está em `~/.ssh/authorized_keys` na VPS
- Verifique permissões: `chmod 600 ~/.ssh/authorized_keys`

### Aplicação não reinicia
- Verifique se o PM2 está instalado: `pm2 --version`
- Verifique se a aplicação existe: `pm2 list`
- Veja os logs: `pm2 logs follow-work`

### Erro nas migrações
- As migrações podem falhar se já estiverem aplicadas (isso é normal)
- Verifique manualmente na VPS se necessário

## Segurança

⚠️ **Importante:**
- Nunca commite a chave privada SSH no repositório
- Use secrets do GitHub para informações sensíveis
- Mantenha a chave privada segura na sua máquina local
- Considere usar um usuário SSH dedicado (não root) para o deploy

## Atualizar Chave SSH

Se precisar atualizar a chave SSH:

1. Gere uma nova chave
2. Adicione a chave pública na VPS
3. Atualize o secret `VPS_SSH_KEY` no GitHub

