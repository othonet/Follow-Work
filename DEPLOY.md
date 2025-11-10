# Guia de Deploy - Follow Work

Este guia explica como fazer o deploy do Follow Work em uma VPS na Contabo.

## Pré-requisitos

- VPS com Ubuntu/Debian
- Node.js (versão 18 ou superior)
- MySQL instalado e configurado
- Git instalado
- PM2 instalado (gerenciador de processos Node.js)

## Passo 1: Conectar na VPS

```bash
ssh usuario@seu-ip-vps
```

## Passo 2: Instalar Dependências do Sistema

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js (usando nvm - recomendado)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Instalar MySQL (se ainda não estiver instalado)
sudo apt install mysql-server -y

# Instalar PM2 globalmente
npm install -g pm2

# Instalar Git (se ainda não estiver instalado)
sudo apt install git -y
```

## Passo 3: Clonar o Repositório

```bash
cd ~
git clone https://github.com/othonet/Follow-Work.git
cd Follow-Work
```

## Passo 4: Configurar o Banco de Dados

```bash
# Acessar MySQL
sudo mysql -u root -p

# Criar banco de dados e usuário
CREATE DATABASE follow_work_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'follow_work_user'@'localhost' IDENTIFIED BY 'sua_senha_segura_aqui';
GRANT ALL PRIVILEGES ON follow_work_db.* TO 'follow_work_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## Passo 5: Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp ENV_EXAMPLE.txt .env

# Editar o arquivo .env
nano .env
```

Configure as seguintes variáveis:

```env
DATABASE_URL="mysql://follow_work_user:sua_senha_segura_aqui@localhost:3306/follow_work_db?schema=public"
JWT_SECRET="sua_chave_secreta_jwt_muito_segura_aqui_altere_em_producao"
PORT=3000
```

**Importante:** Use uma chave JWT forte e segura em produção!

## Passo 6: Instalar Dependências e Configurar Prisma

```bash
# Instalar dependências do projeto
npm install

# Gerar cliente Prisma
npm run prisma:generate

# Executar migrações
npm run prisma:migrate

# Executar seed (opcional - cria usuários admin e dados de exemplo)
npm run prisma:seed
```

## Passo 7: Configurar PM2

```bash
# Iniciar aplicação com PM2
pm2 start server.js --name follow-work

# Configurar PM2 para iniciar automaticamente no boot
pm2 startup
pm2 save
```

## Passo 8: Configurar Nginx (Recomendado)

```bash
# Instalar Nginx
sudo apt install nginx -y

# Criar configuração do site
sudo nano /etc/nginx/sites-available/follow-work
```

Adicione a seguinte configuração:

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ativar o site:

```bash
sudo ln -s /etc/nginx/sites-available/follow-work /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Passo 9: Configurar SSL com Let's Encrypt (Opcional mas Recomendado)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado SSL
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

## Comandos Úteis

### Gerenciar aplicação com PM2

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs follow-work

# Reiniciar aplicação
pm2 restart follow-work

# Parar aplicação
pm2 stop follow-work

# Ver monitoramento
pm2 monit
```

### Atualizar aplicação

```bash
cd ~/Follow-Work
git pull origin main
npm install
npm run prisma:generate
npm run prisma:migrate
pm2 restart follow-work
```

### Ver logs do Nginx

```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## Firewall

Se estiver usando UFW:

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

## Troubleshooting

### Aplicação não inicia
- Verifique os logs: `pm2 logs follow-work`
- Verifique se a porta está disponível: `netstat -tulpn | grep 3000`
- Verifique as variáveis de ambiente no arquivo `.env`

### Erro de conexão com banco de dados
- Verifique se o MySQL está rodando: `sudo systemctl status mysql`
- Verifique as credenciais no arquivo `.env`
- Teste a conexão: `mysql -u follow_work_user -p follow_work_db`

### Erro 502 Bad Gateway
- Verifique se a aplicação está rodando: `pm2 status`
- Verifique os logs do Nginx: `sudo tail -f /var/log/nginx/error.log`
- Verifique se a porta 3000 está correta na configuração do Nginx

