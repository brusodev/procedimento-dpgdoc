# 🚂 Guia de Deploy no Railway

Este guia mostra como fazer deploy do Tutorial System (DPGDOC Academy) no Railway.

## 📋 Pré-requisitos

1. Conta no [Railway](https://railway.app/)
2. Repositório Git (GitHub, GitLab ou Bitbucket)
3. Código do projeto commitado no repositório

## 🔧 Preparação do Projeto

### Backend (FastAPI + Python)

Os seguintes arquivos já foram criados para você:

- ✅ `backend/requirements.txt` - Dependências Python
- ✅ `backend/Procfile` - Comando de inicialização
- ✅ `backend/railway.json` - Configuração do Railway
- ✅ `backend/.env.example` - Exemplo de variáveis de ambiente

### Frontend (React + Vite)

Os seguintes arquivos já foram criados:

- ✅ `frontend/package.json` - Dependências Node.js
- ✅ `frontend/railway.json` - Configuração do Railway

## 🚀 Passo a Passo para Deploy

### 1. Preparar o Repositório Git

```bash
# Se ainda não inicializou o Git
git init

# Adicionar todos os arquivos
git add .

# Commit
git commit -m "Preparar para deploy no Railway"

# Conectar ao repositório remoto (GitHub, GitLab, etc)
git remote add origin <URL_DO_SEU_REPOSITORIO>
git push -u origin main
```

### 2. Deploy do Backend

1. Acesse [Railway](https://railway.app/) e faça login
2. Clique em **"New Project"**
3. Selecione **"Deploy from GitHub repo"**
4. Escolha o repositório do seu projeto
5. Railway detectará automaticamente que é um projeto Python
6. **Configure o Root Directory:**
   - Vá em **Settings** → **Service Settings**
   - Em **Root Directory** coloque: `backend`
7. **Adicione as variáveis de ambiente:**
   - Vá em **Variables**
   - Adicione:
     ```
     CORS_ORIGINS=http://localhost:5173,https://seu-frontend.railway.app
     DATABASE_URL=sqlite:///./tutorial_system.db
     UPLOAD_DIR=./uploads
     MAX_UPLOAD_SIZE=10485760
     ```
8. Clique em **"Deploy"**
9. Aguarde o deploy finalizar
10. **Copie a URL do backend** (algo como `https://seu-backend.railway.app`)

### 3. Deploy do Frontend

1. No mesmo projeto do Railway, clique em **"New"** → **"Service"**
2. Selecione **"Deploy from GitHub repo"**
3. Escolha o mesmo repositório
4. **Configure o Root Directory:**
   - Vá em **Settings** → **Service Settings**
   - Em **Root Directory** coloque: `frontend`
5. **Configure as variáveis de ambiente:**
   - Vá em **Variables**
   - Adicione:
     ```
     VITE_API_URL=https://seu-backend.railway.app
     ```
6. **Atualizar o arquivo de API do frontend:**
   - Você precisará atualizar `frontend/src/services/api.ts`
   - Mudar `baseURL` para usar a variável de ambiente:
     ```typescript
     const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
     ```
7. Clique em **"Deploy"**
8. Aguarde o deploy finalizar
9. **Copie a URL do frontend** (algo como `https://seu-frontend.railway.app`)

### 4. Atualizar CORS no Backend

1. Volte ao serviço do **backend**
2. Vá em **Variables**
3. Atualize `CORS_ORIGINS` com a URL real do frontend:
   ```
   CORS_ORIGINS=https://seu-frontend.railway.app,http://localhost:5173
   ```
4. O Railway irá fazer redeploy automaticamente

## 🗄️ Persistência de Dados

⚠️ **IMPORTANTE**: O SQLite no Railway não é persistente por padrão. Para produção, considere:

### Opção 1: PostgreSQL (Recomendado para Produção)

1. No Railway, clique em **"New"** → **"Database"** → **"PostgreSQL"**
2. Copie a URL de conexão fornecida
3. Atualize a variável `DATABASE_URL` no backend
4. Instale psycopg2 no backend:
   ```bash
   # Adicione ao requirements.txt
   psycopg2-binary==2.9.9
   ```
5. Redeploy o backend

### Opção 2: Railway Volumes (Para SQLite)

1. Vá em **Settings** do backend
2. Em **Volumes**, clique em **"Add Volume"**
3. Configure:
   - **Mount Path**: `/app/data`
   - **Size**: 1 GB (ou conforme necessário)
4. Atualize `DATABASE_URL` para: `sqlite:////app/data/tutorial_system.db`

## 📁 Upload de Arquivos

Os uploads (screenshots e vídeos) também precisam de persistência:

### Com Volumes:
```
UPLOAD_DIR=/app/data/uploads
```

### Alternativa: Usar serviço de storage externo
- Cloudinary (imagens/vídeos)
- AWS S3
- Railway Volumes

## ✅ Verificar Deploy

1. **Backend**: Acesse `https://seu-backend.railway.app/docs`
   - Você deve ver a documentação da API (Swagger)

2. **Frontend**: Acesse `https://seu-frontend.railway.app`
   - Você deve ver a interface do tutorial system

3. **Health Check**: `https://seu-backend.railway.app/health`
   - Deve retornar `{"status": "healthy"}`

## 🔍 Troubleshooting

### Backend não inicia

- Verifique os logs em **Deployments** → **View Logs**
- Confirme que `Root Directory` está como `backend`
- Verifique se todas as dependências estão em `requirements.txt`

### Frontend não conecta ao backend

- Verifique se `VITE_API_URL` está configurado corretamente
- Confirme que o CORS no backend inclui a URL do frontend
- Veja os erros no console do navegador (F12)

### Uploads não funcionam

- Configure volumes ou use storage externo
- Verifique permissões do diretório de upload

### Database não persiste

- Use PostgreSQL ou configure volumes
- SQLite sem volume perde dados a cada redeploy

## 💰 Custos

- Railway oferece **$5 de crédito grátis por mês**
- Projetos pequenos geralmente cabem no plano gratuito
- Se precisar de mais recursos, os planos pagos começam em $5/mês

## 🔐 Segurança

Antes de ir para produção:

1. ✅ Mude `SECRET_KEY` para um valor seguro
2. ✅ Configure HTTPS (Railway faz automaticamente)
3. ✅ Revise permissões de CORS
4. ✅ Adicione autenticação se necessário
5. ✅ Configure limites de upload adequados

## 📚 Recursos Adicionais

- [Documentação do Railway](https://docs.railway.app/)
- [Railway Discord](https://discord.gg/railway) - Comunidade de suporte
- [Templates do Railway](https://railway.app/templates)

## 🎉 Pronto!

Seu Tutorial System está agora rodando no Railway!

Para atualizações futuras, basta fazer `git push` que o Railway fará redeploy automaticamente.
