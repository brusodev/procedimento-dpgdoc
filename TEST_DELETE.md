# Teste de Deleção do Cloudinary

## O que foi corrigido

### Problema 1: public_id não estava sendo armazenado quando o vídeo já existia
**Solução**: Agora extraímos o `public_id` da URL do Cloudinary usando regex

### Problema 2: Não havia confirmação antes de deletar
**Solução**: Adicionada confirmação com `window.confirm()`

## Como Testar

### Teste 1: Upload e Delete Imediato
1. Faça upload de um vídeo/screenshot
2. Clique no X para remover
3. **Verifique**:
   - Aparece confirmação
   - Console mostra: "Video deleted from Cloudinary: [public_id]"
   - Vídeo é removido do Cloudinary

### Teste 2: Carregar Existente e Deletar
1. Salve um tutorial com vídeo
2. Edite o tutorial
3. Clique no X no vídeo existente
4. **Verifique**:
   - Aparece confirmação
   - Console mostra: "Video deleted from Cloudinary: [public_id]"
   - Vídeo é removido do Cloudinary

## Como Verificar se Deletou

### Opção 1: Cloudinary Console
1. Acesse: https://console.cloudinary.com/
2. Vá em Media Library
3. Filtre por: `tutorial_system/videos` ou `tutorial_system/screenshots`
4. O arquivo deve ter desaparecido

### Opção 2: Console do Navegador
Ao clicar no X, você deve ver no console:
```
Video deleted from Cloudinary: tutorial_system/videos/e6oxlbh2n96ecawjkwzj
```

Se houver erro:
```
Failed to delete video from Cloudinary: [erro]
```

## Extração do public_id

A URL do Cloudinary tem este formato:
```
https://res.cloudinary.com/duqectr54/video/upload/v1764005879/tutorial_system/videos/e6oxlbh2n96ecawjkwzj.mp4
```

Extraímos: `tutorial_system/videos/e6oxlbh2n96ecawjkwzj`

### Regex Usado
```javascript
const match = uploadedUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/)
if (match) {
  publicIdToDelete = match[1]
}
```

Explicação:
- `/upload/` - encontra a parte "/upload/" na URL
- `(?:v\d+\/)?` - opcionalmente encontra a versão (v1764005879/)
- `(.+)` - captura tudo depois até a extensão (grupo 1)
- `\.\w+$` - ignora a extensão (.mp4, .jpg, etc)

## Teste Manual da Extração

Cole no console do navegador:
```javascript
const url = "https://res.cloudinary.com/duqectr54/video/upload/v1764005879/tutorial_system/videos/e6oxlbh2n96ecawjkwzj.mp4"
const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/)
console.log('Public ID:', match ? match[1] : 'ERRO')
// Deve mostrar: tutorial_system/videos/e6oxlbh2n96ecawjkwzj
```

## Possíveis Erros

### 1. "Failed to delete video from Cloudinary: 404"
- O vídeo já foi deletado
- O public_id está incorreto

### 2. "Failed to delete video from Cloudinary: 401"
- Credenciais do Cloudinary inválidas no backend

### 3. Nenhuma mensagem no console
- A função não está sendo chamada
- Verifique se o onClick está conectado ao botão

## Debug

Se não estiver funcionando, adicione logs temporariamente:

```javascript
const clearVideo = async () => {
  console.log('1. clearVideo called')
  console.log('2. uploadedUrl:', uploadedUrl)
  console.log('3. uploadedPublicId:', uploadedPublicId)

  const confirmed = window.confirm('...')
  console.log('4. confirmed:', confirmed)

  if (!confirmed) return

  let publicIdToDelete = uploadedPublicId

  if (!publicIdToDelete && uploadedUrl) {
    const match = uploadedUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/)
    console.log('5. regex match:', match)
    if (match) {
      publicIdToDelete = match[1]
      console.log('6. extracted public_id:', publicIdToDelete)
    }
  }

  // ... resto do código
}
```
