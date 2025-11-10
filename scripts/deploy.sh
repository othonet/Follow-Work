#!/bin/bash

# Script de deploy para VPS
# Uso: ./scripts/deploy.sh

set -e

echo "🚀 Iniciando deploy do Follow Work..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: Execute este script a partir do diretório raiz do projeto${NC}"
    exit 1
fi

# Atualizar código do repositório
echo -e "${YELLOW}📥 Atualizando código do repositório...${NC}"
git pull origin main

# Instalar/atualizar dependências
echo -e "${YELLOW}📦 Instalando dependências...${NC}"
npm install

# Gerar Prisma Client
echo -e "${YELLOW}🔧 Gerando Prisma Client...${NC}"
npm run prisma:generate

# Executar migrações
echo -e "${YELLOW}🗄️  Executando migrações do banco de dados...${NC}"
npm run prisma:migrate || echo -e "${YELLOW}⚠️  Migrações já aplicadas ou erro (verifique manualmente)${NC}"

# Reiniciar aplicação com PM2
if command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}🔄 Reiniciando aplicação com PM2...${NC}"
    pm2 restart follow-work || pm2 start server.js --name follow-work
    echo -e "${GREEN}✅ Aplicação reiniciada!${NC}"
else
    echo -e "${YELLOW}⚠️  PM2 não encontrado. Reinicie a aplicação manualmente.${NC}"
fi

echo -e "${GREEN}✨ Deploy concluído com sucesso!${NC}"

