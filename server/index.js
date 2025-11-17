const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: { origin: '*', credentials: true }
});

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'segredo',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.BASE_URL + '/auth/github/callback'
}, (accessToken, refreshToken, profile, done) => {
  const user = {
    id: profile.id,
    username: profile.username,
    email: profile.emails[0]?.value || '',
    avatar: profile.photos[0]?.value || ''
  };
  return done(null, user);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => res.redirect('/dashboard')
);

app.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: 'Nao autenticado' });
  }
});

app.get('/logout', (req, res) => {
  req.logout((err) => {
    res.redirect('/');
  });
});

let posts = [];

app.post('/api/posts', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Nao autenticado' });
  }
  try {
    const { content, fileUrl } = req.body;
    const post = {
      id: Date.now().toString(),
      userId: req.user.id,
      username: req.user.username,
      avatar: req.user.avatar,
      content,
      fileUrl,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: []
    };
    posts.unshift(post);
    io.emit('novo-post', post);
    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/posts', (req, res) => {
  res.json(posts.slice(0, 50));
});

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
  socket.emit('posts-iniciais', posts.slice(0, 50));
  
  socket.on('curtir-post', (postId) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      post.likes++;
      io.emit('post-curtido', { postId, likes: post.likes });
    }
  });
  
  socket.on('comentar', ({ postId, username, text }) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      const comment = { username, text, timestamp: new Date().toISOString() };
      post.comments.push(comment);
      io.emit('novo-comentario', { postId, comment });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
