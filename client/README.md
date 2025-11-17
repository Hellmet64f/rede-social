# Frontend - Rede Social

Arquivos do frontend da rede social feita em HTML, CSS e JavaScript puro.

## Estrutura de Arquivos

- `index.html` - Página principal com autenticação e feed
- `style.css` - Estilos e design responsivo
- `app.js` - Lógica de negocios (login, posts, comentários)

## Como Usar

### 1. Executar o Servidor

Primeiro, certifique-se de que o servidor Node.js está rodando:

```bash
cd server
npm install
node index.js
```

O servidor deve estar rodando em `http://localhost:4000`

### 2. Abrir o Frontend

Abra o arquivo `client/index.html` no navegador ou sirva via HTTP.

**Opção 1: Direto no navegador**
```
Clique no arquivo index.html com o botão direito > Abrir com navegador
```

**Opção 2: Usar um servidor local (recomendado)**
```bash
# Usando Python
cd client
python -m http.server 8000

# Ou usando Node.js
npm install -g http-server
http-server
```

Acesse em `http://localhost:8000`

## Funcionalidades

### Login com GitHub
- Autenticação via OAuth do GitHub
- Mostra avatar e nome do usuário
- Botão de logout

### Criar Postagens
- Escrever texto (até 500 caracteres)
- Enviar fotos ou vídeos
- Preview do arquivo antes de enviar
- Atualização instantânea do feed via WebSocket

### Interação com Posts
- Curtir postagens (likes em tempo real)
- Comentar em posts
- Ver comentários de outros usuários
- Atualização automática de likes e comentários

## Configuração da URL da API

Em `app.js`, você pode alterar a URL do servidor:

```javascript
const API_URL = 'http://localhost:4000';
// Mude para sua URL de produção
```

## Arquivos Base64

Os arquivos (fotos e vídeos) são armazenados em base64 no servidor. Para usar um serviço de armazenamento externo (como AWS S3 ou Cloudinary), modifique a função `uploadFile()` em `app.js`.

## Responsividade

O design é totalmente responsivo e funciona bem em:
- Desktop
- Tablet
- Mobile

## Temas e Customização

As cores principais estão definidas em `style.css`:

```css
#667eea - Cor principal (roxo)
#764ba2 - Cor secundária (roxo escuro)
#48dbfb - Azul (botoes)
#ff6b6b - Vermelho (logout)
```

## Compatibilidade

- Chrome/Edge (vérsado 90+)
- Firefox (versão 88+)
- Safari (versão 14+)

## Erros Comuns

### "Failed to connect to server"
- Certifique-se de que o servidor está rodando em `localhost:4000`
- Verifique o CORS no servidor

### "Página em branco"
- Abra o console (F12) e verifique os erros
- Certifique-se de que todos os arquivos (HTML, CSS, JS) foram carregados

### "Não consegue fazer upload"
- O arquivo pode ser muito grande
- Tente com uma imagem menor (< 5MB)

## Deploy

Para fazer deploy do frontend:

1. Faça upload dos arquivos em `client/` para um host (Vercel, Netlify, GitHub Pages, etc)
2. Atualize a variável `API_URL` com a URL do seu servidor
3. Certifique-se de que o servidor está online e CORS está configurado

## Suporte

Para dúvidas ou problemas, abra uma issue no repositório.
