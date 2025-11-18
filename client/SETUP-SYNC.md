# Rede Social - Guia de Sincronização

## 🌟 OPÇÃO A: FIREBASE (Recomendado - Tempo Real)

Permite que TODOS os usuários vejam as mesmas postagens em TEMPO REAL.

### Passo 1: Criar Projeto Firebase

1. Acesse https://console.firebase.google.com
2. Clique em "Criar projeto"
3. Nome: "rede-social"
4. Clique em "Continuar"
5. Desabilite Google Analytics
6. Crie o projeto

### Passo 2: Configurar Realtime Database

1. No painel do Firebase, vá em "Realtime Database"
2. Clique em "Criar banco de dados"
3. Escolha: "Iníciar no modo de teste"
4. Selecione a região mais próxima
5. Copie a URL do banco (ex: https://seu-projeto.firebaseio.com)

### Passo 3: Obter Configuração

1. Clique no ícone de configuração (engrenagem)
2. Clique em "Configuração do projeto"
3. Copie as credenciais (apiKey, projectId, etc.)

### Passo 4: Atualizar index.html

Substituir o app.js atual pelo app-firebase.js. Adicione ao HTML:

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js"></script>

<script>
  const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto",
    databaseURL: "https://seu-projeto.firebaseio.com",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
  };
  
  const app = firebase.initializeApp(firebaseConfig);
  const database = firebase.database();
</script>

<!-- Seu app -->
<script src="app-firebase.js"></script>
```

### Passo 5: Configurar Regras de Segurança

1. No Firebase, vá em "Regras"
2. Substitua o código por:

```json
{
  "rules": {
    "posts": {
      ".read": true,
      ".write": true,
      "$postId": {
        ".validate": "newData.hasChildren(['username', 'content', 'timestamp'])"
      }
    }
  }
}
```

3. Publique as regras

---

## 🔖 OPÇÃO B: BACKEND NODE.JS + EXPRESS

Mais controle e melhor para produção.

### Passo 1: Criar Backend

```bash
mkdir server
cd server
npm init -y
npm install express cors mongoose dotenv
```

### Passo 2: Arquivo .env

```
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/rede-social
PORT=4000
NODE_ENV=production
```

### Passo 3: Arquivo server.js

```javascript
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Conectar MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Modelo de Post
const postSchema = new mongoose.Schema({
  username: String,
  avatar: String,
  content: String,
  fileUrl: String,
  likes: { type: Number, default: 0 },
  comments: [{
    username: String,
    text: String,
    timestamp: Date
  }],
  timestamp: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', postSchema);

// Rotas
app.get('/api/posts', async (req, res) => {
  const posts = await Post.find().sort({ timestamp: -1 });
  res.json(posts);
});

app.post('/api/posts', async (req, res) => {
  const post = new Post(req.body);
  await post.save();
  res.json(post);
});

app.put('/api/posts/:id/like', async (req, res) => {
  const post = await Post.findByIdAndUpdate(req.params.id, 
    { $inc: { likes: 1 } }, { new: true });
  res.json(post);
});

app.listen(process.env.PORT, () => {
  console.log(`Servidor rodando na porta ${process.env.PORT}`);
});
```

### Passo 4: Deployment no Heroku/Railway

**Railway (Recomendado - Gratuito):**

1. Acesse railway.app
2. Conecte seu GitHub
3. Crie novo projeto
4. Adicione as variáveis de ambiente (.env)
5. Deploy automático

---

## 🆑 Dados Salvos em MongoDB (Gratuito)

1. Acesse mongodb.com/cloud
2. Crie um cluster gratuito
3. Crie um usuário de banco de dados
4. Copie a string de conexão
5. Adicione no .env

---

## ✔️ Status Atual

- **localStorage**: ✅ Funciona (LOCAL apenas)
- **Firebase**: 📋 Pronto para usar (precisa configurar)
- **Backend**: 📋 Pronto para deploy
