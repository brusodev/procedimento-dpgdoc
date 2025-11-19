# Guia de Traduções - PT-BR

## App.tsx
```typescript
// Linha do menu
<Link to="/" ...>Dashboard</Link> → <Link to="/" ...>Painel</Link>
<Link to="/create" ...>Create Tutorial</Link> → <Link to="/create" ...>Criar Tutorial</Link>
<Link to="/progress" ...>My Progress</Link> → <Link to="/progress" ...>Meu Progresso</Link>
```

## TutorialPlayer.tsx
```typescript
// Linha ~73
Step {currentStepIndex + 1} of {steps.length} → Passo {currentStepIndex + 1} de {steps.length}

// Linha ~135
{completedSteps.includes(currentStepIndex) && → {completedSteps.includes(currentStepIndex) &&
  <span>Step completed</span> → <span>Passo concluído</span>

// Linha ~152
Previous → Anterior

// Linha ~160
Complete → Concluir
Next → Próximo

// Linha ~157
Use arrow keys to navigate → Use as setas para navegar
```

## CreateTutorial.tsx
```typescript
// Linha ~12
Create Tutorial → Criar Tutorial
Saving... → Salvando...
Save Tutorial → Salvar Tutorial

// Linha ~114
Title * → Título *
Enter tutorial title → Digite o título do tutorial

// Linha ~119
Description → Descrição
Enter tutorial description → Digite a descrição do tutorial

// Linha ~130
Category → Categoria
e.g., Software, Training, etc. → ex: Software, Treinamento, etc.

// Linha ~141
Tags → Tags
Add a tag and press Enter → Adicione uma tag e pressione Enter

// Linha ~174
Steps → Passos

// Linha ~208
No steps yet. Click + to add one. → Nenhum passo ainda. Clique em + para adicionar.

// Linha ~226
Step title → Título do passo

// Linha ~232
Screenshot → Captura de Tela

// Linha ~240
Video (alternativa ao screenshot) → Vídeo (alternativa à captura de tela)

// Linha ~252
Add Annotations → Adicionar Anotações

// Linha ~266
Instructions → Instruções

// Linha ~278
Add a step to get started → Adicione um passo para começar

// Alerta ao salvar sem título
Please enter a tutorial title → Por favor, digite um título para o tutorial

// Alerta sucesso
Tutorial created successfully! → Tutorial criado com sucesso!

// Alerta erro
Failed to create tutorial: → Falha ao criar tutorial:
```

## ViewTutorial.tsx
```typescript
// Linha ~30
Loading tutorial... → Carregando tutorial...

// Linha ~40
Tutorial not found → Tutorial não encontrado

// Linha ~50
Back to Dashboard → Voltar ao Painel

// Linha ~75
Start Tutorial → Iniciar Tutorial

// Linha ~102
Steps → Passos

// Linha ~147
Tutorial completed! Great job! → Tutorial concluído! Ótimo trabalho!
```

## Dashboard.tsx
```typescript
// Linha ~46
Loading... → Carregando...

// Linha ~55
Dashboard → Painel

// Linha ~63
Total Tutorials → Total de Tutoriais

// Linha ~68
Published → Publicados

// Linha ~73
In Progress → Em Andamento

// Linha ~78
Completed → Concluídos

// Linha ~89
All Tutorials → Todos os Tutoriais

// Linha ~93
No tutorials yet. Create your first tutorial to get started! → Nenhum tutorial ainda. Crie seu primeiro tutorial para começar!

// Linha ~110
Published → Publicado

// Linha ~152
steps → passos

// Linha ~167
View Tutorial → Ver Tutorial
```

## StudentProgress.tsx
```typescript
// Linha ~11
My Progress → Meu Progresso

// Linha ~21
Completed → Concluídos
Tutorials finished → Tutoriais finalizados

// Linha ~30
In Progress → Em Andamento
Currently learning → Aprendendo atualmente

// Linha ~39
Average Score → Pontuação Média
Overall performance → Desempenho geral

// Linha ~50
No progress data yet. → Nenhum dado de progresso ainda.
Start a tutorial to begin tracking your progress! → Inicie um tutorial para começar a acompanhar seu progresso!
```

## ImageAnnotator.tsx
```typescript
// Linha ~44
Select → Selecionar

// Linha ~111
Save Annotations → Salvar Anotações
```

## RichTextEditor.tsx
```typescript
// Linha ~22
Write step instructions here... → Escreva as instruções do passo aqui...

// Botões da toolbar (títulos)
Bold → Negrito
Italic → Itálico
Heading 1 → Título 1
Heading 2 → Título 2
Bullet List → Lista com Marcadores
Numbered List → Lista Numerada
Code Block → Bloco de Código
Quote → Citação
```

## Backend - api/upload.py
```python
# Linha 43
detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}"
→
detail=f"Tipo de arquivo não permitido. Tipos permitidos: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}"

# Linha 61
detail=f"File too large. Maximum size is {MAX_FILE_SIZE / 1024 / 1024}MB"
→
detail=f"Arquivo muito grande. Tamanho máximo é {MAX_FILE_SIZE / 1024 / 1024}MB"

# Linha 83
detail=f"Upload failed: {str(e)}"
→
detail=f"Falha no upload: {str(e)}"

# Linha 95 (vídeo)
detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_VIDEO_EXTENSIONS)}"
→
detail=f"Tipo de arquivo não permitido. Tipos permitidos: {', '.join(ALLOWED_VIDEO_EXTENSIONS)}"

# Linha 114 (vídeo)
detail=f"File too large. Maximum size is {MAX_VIDEO_SIZE / 1024 / 1024}MB"
→
detail=f"Arquivo muito grande. Tamanho máximo é {MAX_VIDEO_SIZE / 1024 / 1024}MB"

# Linha 136
detail="File not found"
→
detail="Arquivo não encontrado"

# Linha 142
"message": "File deleted"
→
"message": "Arquivo excluído"

# Linha 143
detail=f"Delete failed: {str(e)}"
→
detail=f"Falha ao excluir: {str(e)}"

# Linha 155 (vídeo)
"message": "Video deleted"
→
"message": "Vídeo excluído"
```

## Backend - api/tutorials.py
```python
# Linha 66
detail="Tutorial not found"
→
detail="Tutorial não encontrado"

# Linha 110
detail="Tutorial not found"
→
detail="Tutorial não encontrado"

# Linha 129
detail="Tutorial not found"
→
detail="Tutorial não encontrado"

# Linha 147
detail="Step not found"
→
detail="Passo não encontrado"

# Linha 174
detail="Step not found"
→
detail="Passo não encontrado"
```

## Backend - api/analytics.py
```python
# Linha 41
detail="Progress not found"
→
detail="Progresso não encontrado"

# Linha 60
detail="Progress not found"
→
detail="Progresso não encontrado"

# Linha 80
detail="Tutorial not found"
→
detail="Tutorial não encontrado"
```

## README.md - Seções principais
```markdown
# Tutorial System → # Sistema de Tutoriais

## Features → ## Funcionalidades

### Tutorial Editor (Instructor Mode) → ### Editor de Tutoriais (Modo Instrutor)
- Upload screenshots with drag-and-drop → Upload de capturas de tela com arrastar e soltar
- Annotation tools over images → Ferramentas de anotação sobre imagens
- Animated directional arrows → Setas direcionais animadas
- Highlight boxes with numbering → Caixas de destaque com numeração
- Explanatory tooltips → Tooltips explicativos
- Interactive click areas → Áreas de clique interativas
- TipTap editor for adding rich text → Editor TipTap para adicionar texto rico
- Real-time preview → Visualização em tempo real
- Drag-and-drop step organization → Organização de passos com arrastar e soltar
- Category and tag system → Sistema de categorias e tags

### Tutorial Player (Student Mode) → ### Player de Tutoriais (Modo Aluno)
- Full-screen viewing → Visualização em tela cheia
- Step navigation (previous/next) → Navegação entre passos (anterior/próximo)
- Smooth animations with Framer Motion → Animações suaves com Framer Motion
- Visual progress bar → Barra de progresso visual
- Keyboard controls (arrows) → Controles por teclado (setas)

### Analytics System → ### Sistema de Analytics
- Dashboard with statistics → Dashboard com estatísticas
- Progress tracking → Rastreamento de progresso
- Per-tutorial statistics → Estatísticas por tutorial

## Installation and Execution → ## Instalação e Execução

### Option 1: With Docker (Recommended) → ### Opção 1: Com Docker (Recomendado)

### Option 2: Manual Installation → ### Opção 2: Instalação Manual

## Usage Guide → ## Guia de Uso

### Creating a Tutorial → ### Criando um Tutorial

### Viewing a Tutorial → ### Visualizando um Tutorial

## API Endpoints (mantém em inglês no código, só traduz a documentação)

## Next Steps / Roadmap → ## Próximos Passos / Roadmap

## Contributing → ## Contribuindo

## License → ## Licença

## Support → ## Suporte
```

---

## COMO APLICAR ESTAS TRADUÇÕES:

1. Use CTRL+H (Substituir) no VS Code
2. Cole o texto original no campo "Procurar"
3. Cole o texto traduzido no campo "Substituir"
4. Clique em "Substituir Tudo"

Ou use o comando Edit tool com os textos acima para cada arquivo.

**Importante:** Não se esqueça de deletar o arquivo `tutorial_system.db` antes de reiniciar o backend!
