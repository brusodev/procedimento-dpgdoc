# Sistema de Autenticação e Controle de Usuários - DPGDOC Academy

## Recursos Implementados

### Backend (FastAPI + Python)

1. **Autenticação JWT**
   - Login/Logout com tokens JWT
   - Tokens com validade de 7 dias
   - Renovação automática de sessão

2. **Modelos de Dados**
   - Usuários com 3 níveis de acesso: Admin, Instrutor e Estudante
   - Relação muitos-para-muitos entre usuários e tutoriais
   - Controle de acesso granular por tutorial

3. **Rotas de API**
   - `/api/auth/login` - Login de usuário
   - `/api/auth/register` - Registro de novo usuário
   - `/api/auth/me` - Informações do usuário autenticado
   - `/api/users/` - CRUD de usuários (Admin/Instrutor)
   - `/api/users/{id}/tutorials/access` - Gerenciar acesso aos tutoriais

4. **Permissões**
   - **Admin**: Acesso total ao sistema
   - **Instrutor**: Criar tutoriais, gerenciar usuários, ver tutoriais próprios
   - **Estudante**: Ver tutoriais publicados ou com acesso específico

### Frontend (React + TypeScript)

1. **Páginas**
   - Login (`/login`) - Tela de autenticação
   - Usuários (`/users`) - Gerenciamento de usuários (Admin/Instrutor)
   - Dashboard - Lista de tutoriais com filtros por permissão
   - Todas as outras rotas protegidas por autenticação

2. **Componentes**
   - `ProtectedRoute` - HOC para proteção de rotas
   - Store Zustand para gerenciamento de estado de autenticação
   - Interceptors Axios para tokens JWT

3. **Funcionalidades**
   - Criação de usuários com diferentes funções
   - Edição de informações de usuário
   - Ativação/desativação de contas
   - Gerenciamento de acesso aos tutoriais por usuário
   - Logout automático em caso de token expirado

## Como Usar

### 1. Inicializar o Banco de Dados

Primeiro, delete o banco de dados antigo para aplicar as novas tabelas:

```bash
cd backend
del tutorial_system.db  # No Windows
# ou
rm tutorial_system.db   # No Linux/Mac
```

### 2. Criar Usuário Administrador

Execute o script de criação do admin:

```bash
cd backend
python create_admin.py
```

Você pode usar os valores padrão ou customizar:
- **Email**: admin@dpgdoc.com
- **Username**: admin
- **Password**: admin123
- **Nome**: Administrator

**IMPORTANTE**: Altere a senha após o primeiro login!

### 3. Iniciar o Backend

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Iniciar o Frontend

```bash
cd frontend
npm run dev
```

### 5. Fazer Login

1. Acesse `http://localhost:5173/login`
2. Use as credenciais do admin criado
3. Você será redirecionado para o dashboard

## Fluxo de Trabalho

### Como Administrador/Instrutor

1. **Criar Usuários**
   - Vá em "Usuários" no menu
   - Clique em "Novo Usuário"
   - Preencha os dados e selecione a função
   - O usuário receberá as credenciais

2. **Gerenciar Acesso aos Tutoriais**
   - Na lista de usuários, clique no ícone de chave (🔑)
   - Selecione os tutoriais que o usuário pode acessar
   - Clique em "Fechar" para salvar

3. **Criar Tutoriais**
   - Apenas Admin e Instrutores podem criar
   - O criador tem acesso automático ao tutorial
   - Pode definir se é publicado (todos veem) ou privado

### Como Estudante

1. **Acessar Tutoriais**
   - Vê apenas tutoriais publicados
   - Vê tutoriais específicos aos quais tem acesso
   - Pode acompanhar seu progresso

2. **Completar Tutoriais**
   - Segue os passos do tutorial
   - Progresso é salvo automaticamente
   - Pode ver estatísticas em "Meu Progresso"

## Estrutura de Permissões

| Ação | Admin | Instrutor | Estudante |
|------|-------|-----------|-----------|
| Ver tutoriais publicados | ✅ | ✅ | ✅ |
| Ver tutoriais próprios | ✅ | ✅ | ✅ |
| Ver todos os tutoriais | ✅ | ❌ | ❌ |
| Criar tutoriais | ✅ | ✅ | ❌ |
| Editar tutoriais próprios | ✅ | ✅ | ❌ |
| Editar qualquer tutorial | ✅ | ❌ | ❌ |
| Deletar tutoriais próprios | ✅ | ✅ | ❌ |
| Deletar qualquer tutorial | ✅ | ❌ | ❌ |
| Gerenciar usuários | ✅ | ✅ | ❌ |
| Gerenciar acesso aos tutoriais | ✅ | ✅ | ❌ |

## Segurança

- Senhas são hash com bcrypt
- Tokens JWT com expiração de 7 dias
- Middleware de autenticação em todas as rotas protegidas
- CORS configurado para origins específicos
- Validação de dados com Pydantic

## Variáveis de Ambiente

Certifique-se de configurar no `.env` do backend:

```env
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
DATABASE_URL=sqlite:///./tutorial_system.db
```

## Problemas Comuns

### "401 Unauthorized" após login
- Verifique se o backend está rodando
- Limpe o localStorage do navegador
- Faça logout e login novamente

### "403 Forbidden" ao acessar recurso
- Verifique as permissões do seu usuário
- Apenas Admin e Instrutores podem gerenciar usuários
- Estudantes só veem tutoriais publicados

### Não consigo criar usuários
- Verifique se você está logado como Admin ou Instrutor
- Verifique se o email/username já não existe

## Desenvolvimento Futuro

Possíveis melhorias:
- [ ] Recuperação de senha por email
- [ ] Verificação de email na criação de conta
- [ ] Logs de atividade de usuários
- [ ] Notificações de novos tutoriais
- [ ] Dashboard de analytics para instrutores
- [ ] Exportação de dados de progresso
