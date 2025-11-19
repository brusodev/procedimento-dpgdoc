# 📖 DPGDOC Academy - Sistema de Tutoriais Interativos

Sistema completo para criação, gerenciamento e visualização de tutoriais interativos com procedimentos passo-a-passo, suporte a screenshots/vídeos com anotações e acompanhamento de progresso.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🚀 Funcionalidades

### Editor de Tutoriais (Modo Instrutor)
- ✅ Upload de screenshots com drag-and-drop
- ✅ Upload de vídeos (alternativa aos screenshots)
- ✅ Ferramentas de anotação sobre imagens:
  - Setas animadas direcionais
  - Caixas de destaque
  - Tooltips explicativos
  - Áreas de highlight
- ✅ Editor TipTap para texto rico
- ✅ Canvas responsivo e redimensionável
- ✅ Edição completa de tutoriais existentes
- ✅ Organização de passos
- ✅ Sistema de categorias e tags
- ✅ Validação de campos e persistência

### Player de Tutoriais (Modo Aluno)
- ✅ Visualização em tela cheia
- ✅ Controles auto-hide em fullscreen
- ✅ Navegação entre passos (anterior/próximo)
- ✅ Animações suaves com Framer Motion
- ✅ Barra de progresso visual
- ✅ Controles por teclado (setas, F para fullscreen, ESC para sair)
- ✅ Reprodução de vídeos

### Sistema de Analytics
- ✅ Dashboard com estatísticas
- ✅ Rastreamento de progresso
- ✅ Estatísticas por tutorial

## 🛠️ Stack Tecnológica

### Frontend
- React 18 com TypeScript
- Tailwind CSS
- Framer Motion (animações)
- TipTap (editor rico)
- Fabric.js (anotações em canvas)
- Zustand (gerenciamento de estado)
- React Router (navegação)
- Axios (HTTP client)

### Backend
- FastAPI (Python)
- SQLAlchemy + SQLite
- Pydantic (validação)
- Pillow (processamento de imagens)

## 📦 Instalação e Execução

### Opção 1: Com Docker (Recomendado)

1. Certifique-se de ter Docker e Docker Compose instalados

2. Clone o repositório e navegue até a pasta:
```bash
cd procedimento-dpgdoc
```

3. Inicie os containers:
```bash
docker-compose up --build
```

4. Acesse:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - Documentação API: http://localhost:8000/docs

### Opção 2: Instalação Manual

#### Backend

1. Navegue até a pasta do backend:
```bash
cd backend
```

2. Crie um ambiente virtual Python:
```bash
python -m venv venv
```

3. Ative o ambiente virtual:
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

4. Instale as dependências:
```bash
pip install -r requirements.txt
```

5. Crie o arquivo `.env` (copie do `.env.example` e ajuste se necessário):
```bash
copy .env.example .env
```

6. Inicie o servidor:
```bash
uvicorn app.main:app --reload
```

O backend estará rodando em http://localhost:8000

#### Frontend

1. Navegue até a pasta do frontend:
```bash
cd frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O frontend estará rodando em http://localhost:5173

## 🌐 Deploy no Railway

O projeto está pronto para deploy no Railway! Consulte o guia completo em [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md) para instruções detalhadas.

**Deploy rápido:**
1. Crie conta no [Railway](https://railway.app/)
2. Conecte seu repositório GitHub
3. Configure dois serviços com root directories: `backend` e `frontend`
4. Configure as variáveis de ambiente
5. Deploy automático! 🚀

## 📖 Guia de Uso

### Criando um Tutorial

1. Acesse o menu "Create Tutorial"
2. Preencha os metadados do tutorial:
   - Título (obrigatório)
   - Descrição
   - Categoria
   - Tags
3. Adicione passos clicando no botão "+"
4. Para cada passo:
   - Defina um título
   - Faça upload de um screenshot
   - Adicione anotações sobre a imagem:
     - Clique nas ferramentas da barra (Seta, Caixa, Tooltip, Highlight)
     - Clique na imagem para posicionar a anotação
     - Clique em "Save Annotations" para salvar
   - Escreva instruções no editor de texto rico
5. Clique em "Save Tutorial" para salvar

### Visualizando um Tutorial

1. No Dashboard, clique em qualquer tutorial
2. Visualize a página de detalhes
3. Clique em "Start Tutorial" para iniciar o modo apresentação
4. Use os controles:
   - Botões "Previous" e "Next" para navegar
   - Setas do teclado (← →) para navegar
   - ESC para sair

## 🎨 Estrutura do Projeto

```
tutorial-system/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Editor/          # Componentes do editor
│   │   │   │   ├── ImageAnnotator.tsx
│   │   │   │   ├── ScreenshotUpload.tsx
│   │   │   │   └── RichTextEditor.tsx
│   │   │   └── Player/          # Componentes do player
│   │   │       ├── TutorialPlayer.tsx
│   │   │       └── AnnotationOverlay.tsx
│   │   ├── pages/
│   │   │   ├── CreateTutorial/  # Página de criação
│   │   │   ├── ViewTutorial/    # Página de visualização
│   │   │   ├── Dashboard/       # Dashboard
│   │   │   └── StudentProgress/ # Progresso do aluno
│   │   └── services/
│   │       ├── api.ts           # Cliente API
│   │       └── store.ts         # Gerenciamento de estado
│   └── package.json
│
└── backend/
    ├── app/
    │   ├── api/
    │   │   ├── tutorials.py     # Endpoints de tutoriais
    │   │   ├── analytics.py     # Endpoints de analytics
    │   │   └── upload.py        # Upload de imagens
    │   ├── models/              # Modelos SQLAlchemy
    │   │   ├── tutorial.py
    │   │   ├── user.py
    │   │   └── progress.py
    │   └── schemas/             # Schemas Pydantic
    └── requirements.txt
```

## 🔌 API Endpoints

### Tutoriais
- `POST /api/tutorials/` - Criar tutorial
- `GET /api/tutorials/` - Listar tutoriais
- `GET /api/tutorials/{id}` - Obter tutorial específico
- `PUT /api/tutorials/{id}` - Atualizar tutorial
- `DELETE /api/tutorials/{id}` - Deletar tutorial

### Upload
- `POST /api/upload/screenshot` - Upload de screenshot
- `DELETE /api/upload/screenshot/{filename}` - Deletar screenshot

### Analytics
- `POST /api/analytics/progress` - Criar registro de progresso
- `GET /api/analytics/progress/{tutorial_id}` - Obter progresso
- `PUT /api/analytics/progress/{id}` - Atualizar progresso
- `GET /api/analytics/tutorials/{id}/stats` - Estatísticas do tutorial
- `GET /api/analytics/dashboard` - Estatísticas do dashboard

## 🎯 Próximos Passos / Roadmap

- [ ] Implementar autenticação JWT completa
- [ ] Adicionar Driver.js para tours guiados overlay
- [ ] Integrar Reveal.js como motor de apresentação
- [ ] Implementar validação de passos (onde o aluno deve interagir)
- [ ] Adicionar sistema de permissões (admin/instrutor/aluno)
- [ ] Implementar geração de pacotes SCORM 1.2
- [ ] Adicionar heatmap de cliques
- [ ] Exportar relatórios em PDF
- [ ] Suporte para upload em S3
- [ ] Versionamento de tutoriais
- [ ] Modo de avaliação vs modo de prática

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.

## 💡 Suporte

Para reportar bugs ou solicitar features, abra uma issue no repositório.
