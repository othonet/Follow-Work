# Troubleshooting - Erro 502 Bad Gateway

O erro 502 geralmente indica que o servidor web (Nginx) não consegue se comunicar com a aplicação Node.js.

## Passos para Diagnosticar e Resolver

### 1. Verificar se a aplicação está rodando

Conecte-se na VPS via SSH e execute:

```bash
pm2 status
```

**Se a aplicação não estiver rodando:**
```bash
cd ~/Follow-Work
pm2 start server.js --name follow-work
pm2 save
```

**Se a aplicação estiver com erro:**
```bash
pm2 logs follow-work
```

Isso mostrará os erros que estão impedindo a aplicação de iniciar.

### 2. Verificar logs do PM2

```bash
pm2 logs follow-work --lines 50
```

Procure por erros como:
- Erros de conexão com banco de dados
- Erros de sintaxe JavaScript
- Erros de módulos não encontrados

### 3. Verificar se a porta está correta

```bash
# Verificar se algo está rodando na porta 3000
netstat -tulpn | grep 3000
```

### 4. Verificar logs do Nginx

```bash
sudo tail -f /var/log/nginx/error.log
```

### 5. Reiniciar a aplicação

```bash
cd ~/Follow-Work
git pull origin main
npm install
npm run prisma:generate
pm2 restart follow-work
```

### 6. Verificar variáveis de ambiente

Certifique-se de que o arquivo `.env` está configurado corretamente:

```bash
cd ~/Follow-Work
cat .env
```

Verifique se:
- `DATABASE_URL` está correto
- `JWT_SECRET` está definido
- `PORT` está definido (padrão: 3000)

### 7. Verificar conexão com banco de dados

```bash
# Testar conexão MySQL
mysql -u follow_work_user -p follow_work_db
```

### 8. Verificar se o Prisma Client está atualizado

```bash
cd ~/Follow-Work
npm run prisma:generate
pm2 restart follow-work
```

### 9. Verificar configuração do Nginx

```bash
sudo nginx -t
```

Se houver erros, verifique o arquivo de configuração:
```bash
sudo nano /etc/nginx/sites-available/follow-work
```

Certifique-se de que está apontando para `http://localhost:3000`

### 10. Reiniciar Nginx

```bash
sudo systemctl restart nginx
```

## Solução Rápida (Tentativa de Corrigir Tudo)

Execute estes comandos na ordem:

```bash
# Conectar na VPS
ssh usuario@seu-ip-vps

# Ir para o diretório do projeto
cd ~/Follow-Work

# Atualizar código
git pull origin main

# Instalar dependências
npm install

# Gerar Prisma Client
npm run prisma:generate

# Reiniciar aplicação
pm2 restart follow-work

# Verificar status
pm2 status
pm2 logs follow-work --lines 20

# Reiniciar Nginx
sudo systemctl restart nginx
```

## Problemas Comuns

### Aplicação crasha ao iniciar
- Verifique os logs: `pm2 logs follow-work`
- Verifique se o banco de dados está acessível
- Verifique se todas as dependências estão instaladas

### Erro de conexão com banco de dados
- Verifique se o MySQL está rodando: `sudo systemctl status mysql`
- Verifique as credenciais no `.env`
- Teste a conexão manualmente

### Porta já em uso
- Verifique o que está usando a porta: `netstat -tulpn | grep 3000`
- Pare outros processos ou altere a porta no `.env`

### Prisma Client desatualizado
- Execute: `npm run prisma:generate`
- Reinicie: `pm2 restart follow-work`

