# 📱 Rede Social com GitHub OAuth

Uma rede social em tempo real onde você e seus amigos podem compartilhar fotos, vídeos e textos!

## ✨ Features
- ✅ Login com GitHub OAuth
- ✅ Upload de fotos e vídeos
- ✅ Banco de dados gratuito (Firebase)
- ✅ Feed com todos os posts
- ✅ Atualizacoes em TEMPO REAL (WebSocket)
- ✅ 100% Gratuito

## 🚀 Como Começar

### Passo 1: Clone o repositório
```bash
git clone https://github.com/Hellmet64f/rede-social.git
cd rede-social
```

### Passo 2: Instale dependencias
```bash
npm install
cd client && npm install && cd ..
```

### Passo 3: Configure variaveis de ambiente

Crie arquivo `.env` na raiz do servidor:
```
PORT=4000
NODE_ENV=development
BASE_URL=http://localhost:3000
GITHUB_CLIENT_ID=seu_client_id
GITHUB_CLIENT_SECRET=seu_client_secret
SESSION_SECRET=chave_super_secreta
FIREBASE_PROJECT_ID=seu-projeto
CLOUDINARY_NAME=seu_cloudinary_name
CLOUDINARY_API_KEY=seu_api_key
CLOUDINARY_API_SECRET=seu_api_secret
```

### Passo 4: Rode localmente

Terminal 1 (Backend):
```bash
cd server
npm start
```

Terminal 2 (Frontend):
```bash
cd client
npm start
```

Acesse `http://localhost:3000`

## 🔧 Stack Tecnologico
- Frontend: React.js + Socket.io
- Backend: Node.js + Express + Socket.io
- Database: Firebase Realtime Database
- Auth: GitHub OAuth 2.0
- Storage: Cloudinary

## 🌐 Deploy

### Frontend (Vercel)
- Ir para https://vercel.com
- Conectar GitHub
- Importar este repositório
- Deploy automático

### Backend (Railway ou Render)
- Ir para https://railway.app
- Conectar GitHub
- Criar novo projeto
- Deploy automático

## 🔐 Segurança
- Nunca commite arquivos .env
- Use variaveis de ambiente
- No Vercel/Railway: Adicione variaveis na dashboard

Criado com amor para a comunidade
