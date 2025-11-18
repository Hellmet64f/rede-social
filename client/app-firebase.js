// Versão Firebase da Rede Social
// Compartilha dados em TEMPO REAL entre todos os usuários
// Requer Firebase Realtime Database

// IMPORTANTE: Configure suas credenciais do Firebase abaixo
const firebaseConfig = {
  apiKey: "AIzaSyD_sua_chave_aqui",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  databaseURL: "https://seu-projeto.firebaseio.com",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijk"
};

// Inicializar Firebase (adicione isso ao seu HTML antes de app-firebase.js)
// <script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js"></script>
// <script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js"></script>

// const app = firebase.initializeApp(firebaseConfig);
// const database = firebase.database();

const loginPage = document.getElementById('loginPage');
const dashboardPage = document.getElementById('dashboardPage');
const feedContainer = document.getElementById('feedContainer');
const postBtn = document.getElementById('postBtn');
const postContent = document.getElementById('postContent');
const fileInput = document.getElementById('fileInput');
const logoutBtn = document.getElementById('logoutBtn');
const userAvatar = document.getElementById('userAvatar');
const userAvatarForm = document.getElementById('userAvatarForm');
const username = document.getElementById('username');
const charCount = document.getElementById('charCount');
const filePreview = document.getElementById('filePreview');
const uploadBtn = document.querySelector('.btn-upload');

let currentUser = null;
let selectedFile = null;
let database = null;

window.addEventListener('load', () => {
  checkAuthStatus();
  setupEventListeners();
  loadPostsFromFirebase();
});

function checkAuthStatus() {
  const userData = localStorage.getItem('currentUser');
  if (userData) {
    try {
      currentUser = JSON.parse(userData);
      showDashboard();
    } catch (e) {
      localStorage.removeItem('currentUser');
      showLogin();
    }
  } else {
    showLogin();
  }
}

function showLogin() {
  if (loginPage) loginPage.classList.remove('hidden');
  if (dashboardPage) dashboardPage.classList.add('hidden');
}

function showDashboard() {
  if (loginPage) loginPage.classList.add('hidden');
  if (dashboardPage) dashboardPage.classList.remove('hidden');
  if (currentUser) {
    if (userAvatar) userAvatar.src = currentUser.avatar || 'https://via.placeholder.com/40';
    if (userAvatarForm) userAvatarForm.src = currentUser.avatar || 'https://via.placeholder.com/40';
    if (username) username.textContent = currentUser.username;
  }
}

function setupEventListeners() {
  if (postBtn) postBtn.addEventListener('click', handlePostSubmit);
  if (postContent) postContent.addEventListener('input', (e) => {
    if (charCount) charCount.textContent = `${e.target.value.length}/500`;
  });
  if (uploadBtn) uploadBtn.addEventListener('click', () => {
    if (fileInput) fileInput.click();
  });
  if (fileInput) fileInput.addEventListener('change', handleFileSelect);
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
}

function handleFileSelect(e) {
  selectedFile = e.target.files[0];
  if (selectedFile) showFilePreview();
}

function showFilePreview() {
  if (!filePreview) return;
  if (!selectedFile) {
    filePreview.classList.add('hidden');
    return;
  }
  filePreview.classList.remove('hidden');
  filePreview.innerHTML = '';
  
  if (selectedFile.type.startsWith('image/')) {
    const img = document.createElement('img');
    const reader = new FileReader();
    reader.onload = (e) => img.src = e.target.result;
    reader.readAsDataURL(selectedFile);
    filePreview.appendChild(img);
  } else if (selectedFile.type.startsWith('video/')) {
    const video = document.createElement('video');
    const reader = new FileReader();
    reader.onload = (e) => {
      video.src = e.target.result;
      video.controls = true;
    };
    reader.readAsDataURL(selectedFile);
    filePreview.appendChild(video);
  }
  
  const removeBtn = document.createElement('button');
  removeBtn.className = 'remove-file';
  removeBtn.textContent = '✕';
  removeBtn.onclick = () => {
    selectedFile = null;
    if (fileInput) fileInput.value = '';
    filePreview.classList.add('hidden');
  };
  filePreview.appendChild(removeBtn);
}

async function handlePostSubmit() {
  if (!currentUser) {
    alert('Você precisa estar logado!');
    showLogin();
    return;
  }
  
  const content = postContent.value.trim();
  if (!content && !selectedFile) {
    alert('Escreva algo ou selecione um arquivo!');
    return;
  }
  
  if (postBtn) {
    postBtn.disabled = true;
    postBtn.textContent = 'Enviando...';
  }
  
  let fileUrl = null;
  if (selectedFile) {
    fileUrl = await uploadFile();
  }
  
  try {
    // Se Firebase estiver configurado
    if (typeof firebase !== 'undefined' && firebase.database) {
      const database = firebase.database();
      const post = {
        id: Date.now(),
        username: currentUser.username,
        avatar: currentUser.avatar || 'https://via.placeholder.com/40',
        content: content,
        fileUrl: fileUrl,
        timestamp: new Date().toISOString(),
        likes: 0,
        comments: []
      };
      
      await database.ref('posts/' + post.id).set(post);
    } else {
      // Fallback para localStorage
      const posts = JSON.parse(localStorage.getItem('posts') || '[]');
      const post = {
        id: Date.now(),
        username: currentUser.username,
        avatar: currentUser.avatar || 'https://via.placeholder.com/40',
        content: content,
        fileUrl: fileUrl,
        timestamp: new Date().toISOString(),
        likes: 0,
        comments: []
      };
      posts.unshift(post);
      localStorage.setItem('posts', JSON.stringify(posts));
    }
    
    if (postContent) postContent.value = '';
    selectedFile = null;
    if (fileInput) fileInput.value = '';
    if (filePreview) filePreview.classList.add('hidden');
    if (charCount) charCount.textContent = '0/500';
    
    loadPostsFromFirebase();
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao enviar post');
  } finally {
    if (postBtn) {
      postBtn.disabled = false;
      postBtn.textContent = 'Postar';
    }
  }
}

async function uploadFile() {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(selectedFile);
  });
}

function loadPostsFromFirebase() {
  // Se Firebase estiver configurado, carregar de lá
  if (typeof firebase !== 'undefined' && firebase.database) {
    const database = firebase.database();
    database.ref('posts').on('value', (snapshot) => {
      const data = snapshot.val();
      const posts = data ? Object.values(data).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) : [];
      displayPosts(posts);
    });
  } else {
    // Fallback para localStorage
    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
    displayPosts(posts);
  }
}

function displayPosts(posts) {
  if (!feedContainer) return;
  feedContainer.innerHTML = '';
  
  if (posts.length === 0) {
    feedContainer.innerHTML = '<div class="loading">Nenhuma postagem ainda. Seja o primeiro a postar!</div>';
    return;
  }
  
  posts.forEach(post => {
    const postElement = createPostElement(post);
    feedContainer.appendChild(postElement);
  });
}

function createPostElement(post) {
  const div = document.createElement('div');
  div.className = 'post';
  
  const header = `
    <div class="post-header">
      <img src="${post.avatar}" alt="Avatar" class="avatar">
      <div class="post-header-info">
        <h3>${escapeHtml(post.username)}</h3>
        <time>${new Date(post.timestamp).toLocaleString('pt-BR')}</time>
      </div>
    </div>
  `;
  
  let content = `<div class="post-content"><p class="post-text">${escapeHtml(post.content)}</p>`;
  if (post.fileUrl) {
    if (post.fileUrl.startsWith('data:image')) {
      content += `<img src="${post.fileUrl}" alt="Imagem" class="post-media">`;
    } else if (post.fileUrl.startsWith('data:video')) {
      content += `<video controls class="post-media"><source src="${post.fileUrl}"></video>`;
    }
  }
  content += '</div>';
  
  const footer = `
    <div class="post-footer">
      <button class="post-action like-btn" data-post-id="${post.id}">
        💙 <span class="likes-count">${post.likes || 0}</span>
      </button>
      <button class="post-action comment-btn" data-post-id="${post.id}">
        💬 ${post.comments?.length || 0}
      </button>
    </div>
  `;
  
  let comments = '';
  if (post.comments && post.comments.length > 0) {
    comments += '<div class="comments-section">';
    post.comments.forEach(comment => {
      comments += `
        <div class="comment">
          <div class="comment-author">${escapeHtml(comment.username)}</div>
          <div class="comment-text">${escapeHtml(comment.text)}</div>
        </div>
      `;
    });
    comments += '</div>';
  }
  
  comments += `
    <div class="comment-input-group">
      <input type="text" placeholder="Escrever um comentário..." class="comment-input" data-post-id="${post.id}">
      <button class="comment-btn send-comment" data-post-id="${post.id}">Enviar</button>
    </div>
  `;
  
  div.innerHTML = header + content + footer + comments;
  
  const likeBtn = div.querySelector('.like-btn');
  if (likeBtn) likeBtn.addEventListener('click', () => handleLike(post.id));
  
  const sendCommentBtn = div.querySelector('.send-comment');
  const commentInput = div.querySelector('.comment-input');
  if (sendCommentBtn) {
    sendCommentBtn.addEventListener('click', () => {
      if (commentInput && currentUser) {
        const text = commentInput.value.trim();
        if (text) handleComment(post.id, text);
      }
    });
  }
  
  return div;
}

function handleLike(postId) {
  if (typeof firebase !== 'undefined' && firebase.database) {
    const database = firebase.database();
    database.ref('posts/' + postId + '/likes').transaction((current) => {
      return (current || 0) + 1;
    });
  }
}

function handleComment(postId, text) {
  if (!currentUser) return;
  
  if (typeof firebase !== 'undefined' && firebase.database) {
    const database = firebase.database();
    const comment = {
      username: currentUser.username,
      text: text,
      timestamp: new Date().toISOString()
    };
    database.ref('posts/' + postId + '/comments').push(comment);
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function handleLogout() {
  localStorage.removeItem('currentUser');
  currentUser = null;
  showLogin();
}

function registerUser(username, avatar) {
  currentUser = {
    username: username,
    avatar: avatar || 'https://via.placeholder.com/40'
  };
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  showDashboard();
  loadPostsFromFirebase();
}
