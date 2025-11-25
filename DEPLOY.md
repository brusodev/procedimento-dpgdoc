# Guia de Deploy no Railway

Este guia explica como fazer o deploy do Sistema de Tutoriais no Railway.

## Pré-requisitos

1. Conta no [Railway](https://railway.app)
2. Conta no [Cloudinary](https://cloudinary.com) para armazenamento de mídia
3. GitHub CLI ou acesso ao repositório

## Estrutura do Projeto

O projeto está configurado para fazer deploy de uma aplicação monorepo:
- **Backend**: FastAPI (Python) - serve a API e os arquivos estáticos do frontend
- **Frontend**: React + Vite - compilado e servido pelo backend
- **Banco de Dados**: PostgreSQL (provisionado pelo Railway)

## Passo 1: Preparar o Repositório

Certifique-se de que todos os arquivos de configuração estão commitados:
- `railway.json` - Configuração do Railway
- `nixpacks.toml` - Configuração de build
- `Procfile` - Comando de inicialização
- `backend/requirements.txt` - Dependências Python
- `frontend/package.json` - Dependências Node.js

## Passo 2: Criar Projeto no Railway

1. Acesse [railway.app](https://railway.app) e faça login
2. Clique em "New Project"
3. Escolha "Deploy from GitHub repo"
4. Selecione seu repositório
5. O Railway detectará automaticamente a configuração

## Passo 3: Adicionar PostgreSQL

1. No dashboard do projeto, clique em "+ New"
2. Selecione "Database" → "PostgreSQL"
3. O Railway criará automaticamente a variável `DATABASE_URL`

## Passo 4: Configurar Variáveis de Ambiente

No painel de variáveis do Railway, adicione:

### Variáveis Obrigatórias

```bash
# Banco de Dados (já criado automaticamente pelo Railway)
DATABASE_URL=postgresql://...

# Segurança - GERE UMA NOVA SECRET KEY!
# Use: openssl rand -hex 32
SECRET_KEY=sua-secret-key-segura-aqui

# Cloudinary (para upload de imagens/vídeos)
CLOUDINARY_CLOUD_NAME=seu-cloud-name
CLOUDINARY_API_KEY=sua-api-key
CLOUDINARY_API_SECRET=sua-api-secret

# CORS - Adicione o domínio do Railway
CORS_ORIGINS=https://seu-app.railway.app,http://localhost:5173

# Configurações de Upload
MAX_UPLOAD_SIZE=10485760
```

### Como Obter Credenciais do Cloudinary

1. Acesse [cloudinary.com](https://cloudinary.com) e faça login
2. No Dashboard, você encontrará:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

## Passo 5: Deploy

1. O Railway iniciará o deploy automaticamente
2. O processo:
   - Instala Python 3.10 e Node.js 18
   - Instala dependências do backend (`pip install -r requirements.txt`)
   - Instala dependências do frontend (`npm install`)
   - Compila o frontend (`npm run build`)
   - Inicia o servidor (`uvicorn app.main:app`)

3. Aguarde o deploy completar (geralmente 3-5 minutos)

## Passo 6: Configurar Domínio

1. No painel do projeto, clique em "Settings"
2. Em "Domains", clique em "Generate Domain"
3. O Railway criará um domínio como: `seu-app.railway.app`

## Passo 7: Criar Usuário Admin Inicial

Após o deploy, você precisa criar o primeiro usuário admin:

### Opção 1: Via Railway CLI

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Fazer login
railway login

# Conectar ao projeto
railway link

# Executar shell
railway run python backend/create_admin.py
```

### Opção 2: Via Script Python (criar localmente)

Crie um arquivo `create_first_admin.py`:

```python
import requests
import os

# URL do seu app no Railway
BASE_URL = "https://seu-app.railway.app"

response = requests.post(
    f"{BASE_URL}/api/auth/register",
    json={
        "email": "admin@example.com",
        "username": "admin",
        "password": "SuaSenhaSegura123!",
        "full_name": "Administrador",
        "role": "Admin"
    }
)

print(response.json())
```

Execute: `python create_first_admin.py`

## Passo 8: Verificar Deploy

1. Acesse `https://seu-app.railway.app`
2. Você deve ver a tela de login
3. Faça login com as credenciais do admin
4. Teste a criação de um tutorial

## Monitoramento

### Logs

Visualize os logs em tempo real no Railway:
- Clique no serviço
- Vá para a aba "Logs"

### Health Check

O Railway verifica automaticamente a rota `/health` para garantir que o app está funcionando.

Acesse: `https://seu-app.railway.app/health`

Resposta esperada:
```json
{
  "status": "healthy"
}
```

## Atualizações

O Railway faz deploy automático quando você faz push para o repositório:

```bash
git add .
git commit -m "Atualização do sistema"
git push origin main
```

## Troubleshooting

### Erro: "Build failed"

**Solução**: Verifique os logs de build no Railway. Possíveis causas:
- Dependências faltando no `requirements.txt` ou `package.json`
- Erros de compilação do frontend
- Versão incompatível do Python/Node

### Erro: "Application failed to respond"

**Solução**: Verifique:
1. A variável `PORT` está sendo usada corretamente
2. O servidor está escutando em `0.0.0.0` (não `localhost`)
3. O healthcheck path `/health` está respondendo

### Erro: "Database connection failed"

**Solução**: Verifique:
1. O PostgreSQL está provisionado no Railway
2. A variável `DATABASE_URL` está configurada
3. O formato da URL está correto: `postgresql://user:password@host:port/database`

### Upload de arquivos não funciona

**Solução**: Verifique:
1. Credenciais do Cloudinary estão corretas
2. As variáveis `CLOUDINARY_*` estão configuradas
3. Teste o upload manualmente no Cloudinary Dashboard

## Custos

O Railway oferece:
- **Plano Hobby**: $5/mês de crédito grátis
- Após o crédito: ~$5-10/mês para este projeto (dependendo do uso)

Custos típicos:
- PostgreSQL: ~$2/mês
- Backend/Frontend: ~$3-5/mês (baseado em uso)

## Segurança

### Recomendações:

1. **Nunca commite credenciais no repositório**
   - Use variáveis de ambiente no Railway
   - Adicione `.env` ao `.gitignore`

2. **Gere uma SECRET_KEY forte**
   ```bash
   openssl rand -hex 32
   ```

3. **Configure CORS corretamente**
   - Adicione apenas domínios confiáveis
   - Remova `http://localhost` em produção

4. **Use HTTPS**
   - O Railway fornece HTTPS automaticamente

5. **Limite de taxa (Rate Limiting)**
   - Considere adicionar middleware de rate limiting
   - Protege contra ataques de força bruta

## Backup do Banco de Dados

O Railway faz backup automático do PostgreSQL, mas você pode fazer backups manuais:

```bash
# Conectar via Railway CLI
railway run pg_dump $DATABASE_URL > backup.sql

# Restaurar
railway run psql $DATABASE_URL < backup.sql
```

## Variáveis de Ambiente - Resumo

| Variável | Obrigatória | Descrição | Exemplo |
|----------|-------------|-----------|---------|
| `DATABASE_URL` | ✅ | URL do PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `SECRET_KEY` | ✅ | Chave secreta JWT | `abc123...` (use `openssl rand -hex 32`) |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Nome da conta Cloudinary | `duqectr54` |
| `CLOUDINARY_API_KEY` | ✅ | API Key do Cloudinary | `722932516364447` |
| `CLOUDINARY_API_SECRET` | ✅ | API Secret do Cloudinary | `e3VUwWt...` |
| `CORS_ORIGINS` | ✅ | Domínios permitidos | `https://app.railway.app` |
| `MAX_UPLOAD_SIZE` | ❌ | Tamanho máx upload (bytes) | `10485760` (10MB) |

## Suporte

- [Documentação do Railway](https://docs.railway.app)
- [Comunidade Railway](https://discord.gg/railway)
- [Documentação Cloudinary](https://cloudinary.com/documentation)

## Checklist de Deploy

- [ ] Conta Railway criada
- [ ] Conta Cloudinary criada e credenciais obtidas
- [ ] Código commitado no GitHub
- [ ] Projeto criado no Railway
- [ ] PostgreSQL adicionado ao projeto
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy concluído com sucesso
- [ ] Domínio gerado
- [ ] Health check respondendo
- [ ] Usuário admin criado
- [ ] Login testado
- [ ] Upload de mídia testado
- [ ] Tutorial criado e visualizado

Pronto! Seu Sistema de Tutoriais está agora rodando em produção no Railway! 🚀
