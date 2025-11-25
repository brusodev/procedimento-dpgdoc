# Debug de Vídeos - DPGDOC Academy

## Problemas Corrigidos

### 1. Deleção de Vídeos do Cloudinary
- ✅ Agora quando você clica no X para remover um vídeo/screenshot, ele é deletado do Cloudinary
- Os componentes `VideoUpload` e `ScreenshotUpload` agora armazenam o `public_id` retornado pelo backend
- Quando você remove, é feita uma chamada para a API de delete do Cloudinary

### 2. URLs dos Vídeos
- ✅ As URLs são armazenadas diretamente do Cloudinary (formato: `https://res.cloudinary.com/...`)
- ✅ O player usa essas URLs diretamente, sem passar pelo localhost

## Como Testar

### Teste 1: Upload e Visualização
1. Faça login no sistema
2. Crie ou edite um tutorial
3. Adicione um vídeo a um passo
4. Salve o tutorial
5. Acesse o tutorial em modo de visualização
6. **Verifique**: O vídeo deve reproduzir normalmente

### Teste 2: Deleção do Cloudinary
1. Faça upload de um vídeo
2. Antes de salvar, clique no X para remover
3. **Verifique no Cloudinary**: O vídeo deve ter sido deletado
4. Faça outro upload
5. Salve o tutorial
6. Edite novamente e remova o vídeo
7. **Verifique no Cloudinary**: O vídeo deve ter sido deletado

## Debug: Se o Vídeo Não Reproduzir

### Passo 1: Verificar a URL no Banco
```powershell
cd backend
python -c "import sqlite3; conn = sqlite3.connect('tutorial_system.db'); cursor = conn.cursor(); cursor.execute('SELECT id, title, video_url FROM steps WHERE video_url IS NOT NULL'); print('\n'.join([f'{row[0]}: {row[1]} -> {row[2]}' for row in cursor.fetchall()]))"
```

A URL deve estar no formato:
```
https://res.cloudinary.com/duqectr54/video/upload/v1234567890/tutorial_system/videos/nome_do_video.mp4
```

### Passo 2: Testar a URL Diretamente
1. Copie a URL do vídeo do banco de dados
2. Cole diretamente no navegador
3. **Se não funcionar**: O vídeo pode ter sido deletado do Cloudinary ou há problema de permissões

### Passo 3: Verificar CORS
Abra o console do navegador (F12) e verifique se há erros de CORS quando o vídeo tenta carregar.

### Passo 4: Verificar o Formato do Vídeo
O Cloudinary aceita: MP4, WebM, MOV, AVI
O navegador reproduz melhor: MP4 (H.264) e WebM

Se o vídeo estiver em formato não suportado pelo navegador, o Cloudinary faz conversão automática.

## Logs Úteis

### Verificar vídeos no Cloudinary
1. Acesse: https://console.cloudinary.com/
2. Login com suas credenciais
3. Vá em Media Library
4. Filtre por: `tutorial_system/videos`

### Verificar Console do Navegador
```javascript
// Execute no console do navegador enquanto visualiza um tutorial:
document.querySelector('video').src
// Deve retornar a URL completa do Cloudinary
```

## Alterações Feitas

### Backend
- `upload.py`: Já estava retornando `public_id` corretamente
- `upload.py`: Endpoints de delete já existiam e funcionam

### Frontend
- `VideoUpload.tsx`: Agora armazena `public_id` e deleta do Cloudinary ao remover
- `ScreenshotUpload.tsx`: Mesma mudança
- `TutorialPlayer.tsx`: Já estava usando URLs diretas
- `api.ts`: Já estava configurado corretamente

## Checklist de Troubleshooting

- [ ] O vídeo aparece no preview após upload?
- [ ] A URL no banco está completa (começa com https://res.cloudinary.com)?
- [ ] O vídeo existe no Cloudinary? (verificar Media Library)
- [ ] Há erros no console do navegador (F12)?
- [ ] O vídeo funciona se copiado diretamente no navegador?
- [ ] O backend está rodando e respondendo?
- [ ] As credenciais do Cloudinary no .env estão corretas?
