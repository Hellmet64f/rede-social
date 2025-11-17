    // Elementos da página
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
let socket = null;

const API_URL = 'http://localhost:4000';

// Verificar se usuário está logado ao carregar página
window.addEventListener('load', () => {
    checkAuthStatus();
    setupEventListeners();
});

// Verificar status de autenticação
async function checkAuthStatus() {
    try {
        const response = await fetch(`${API_URL}/api/user`, {
            credentials: 'include'
        });
        if (response.ok) {
            currentUser = await response.json();
            showDashboard();
            initializeSocket();
            loadPosts();
        } else {
            showLogin();
        }
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        showLogin();
    }
}

// Mostrar página de login
function showLogin() {
    loginPage.classList.remove('hidden');
    dashboardPage.classList.add('hidden');
}

// Mostrar dashboard
function showDashboard() {
    loginPage.classList.add('hidden');
    dashboardPage.classList.remove('hidden');
    if (currentUser) {
        userAvatar.src = currentUser.avatar;
        userAvatarForm.src = currentUser.avatar;
        username.textContent = currentUser.username;
    }
}

// Setup de event listeners
function setupEventListeners() {
    // Botão de postar
    postBtn.addEventListener('click', handlePostSubmit);
    
    // Contador de caracteres
    postContent.addEventListener('input', (e) => {
        charCount.textContent = `${e.target.value.length}/500`;
    });
    
    // Upload de arquivo
    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    
    // Logout
    logoutBtn.addEventListener('click', handleLogout);
}

// Selecionar arquivo
function handleFileSelect(e) {
    selectedFile = e.target.files[0];
    if (selectedFile) {
        showFilePreview();
    }
}

// Mostrar preview do arquivo
function showFilePreview() {
    if (!selectedFile) {
        filePreview.classList.add('hidden');
        return;
    }

    filePreview.classList.remove('hidden');
    filePreview.innerHTML = '';

    if (selectedFile.type.startsWith('image/')) {
        const img = document.createElement('img');
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
        };
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
        fileInput.value = '';
        filePreview.classList.add('hidden');
    };
    filePreview.appendChild(removeBtn);
}

// Enviar post
async function handlePostSubmit() {
    const content = postContent.value.trim();
    
    if (!content && !selectedFile) {
        alert('Escreva algo ou selecione um arquivo!');
        return;
    }

    postBtn.disabled = true;
    postBtn.textContent = 'Enviando...';

    let fileUrl = null;
    if (selectedFile) {
        fileUrl = await uploadFile();
    }

    try {
        const response = await fetch(`${API_URL}/api/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                content: content,
                fileUrl: fileUrl
            })
        });

        if (response.ok) {
            postContent.value = '';
            selectedFile = null;
            fileInput.value = '';
            filePreview.classList.add('hidden');
            charCount.textContent = '0/500';
        } else {
            alert('Erro ao enviar post');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao enviar post');
    } finally {
        postBtn.disabled = false;
        postBtn.textContent = 'Postar';
    }
}

// Upload de arquivo
async function uploadFile() {
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
        // Se você tem um endpoint de upload, use aqui
        // Caso contrário, converta para base64
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve(e.target.result); // Retorna base64
            };
            reader.readAsDataURL(selectedFile);
        });
    } catch (error) {
        console.error('Erro ao upload:', error);
        return null;
    }
}

// Carregar posts
async function loadPosts() {
    try {
        const response = await fetch(`${API_URL}/api/posts`);
        if (response.ok) {
            const posts = await response.json();
            displayPosts(posts);
        }
    } catch (error) {
        console.error('Erro ao carregar posts:', error);
    }
}

// Exibir posts
function displayPosts(posts) {
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

// Criar elemento de post
function createPostElement(post) {
    const div = document.createElement('div');
    div.className = 'post';

    const header = `
        <div class="post-header">
            <img src="${post.avatar}" alt="Avatar" class="avatar">
            <div class="post-header-info">
                <h3>${post.username}</h3>
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
                    <div class="comment-time">${new Date(comment.timestamp).toLocaleString('pt-BR')}</div>
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

    // Event listeners
    const likeBtn = div.querySelector('.like-btn');
    likeBtn.addEventListener('click', () => handleLike(post.id, likeBtn));

    const sendCommentBtn = div.querySelector('.send-comment');
    const commentInput = div.querySelector('.comment-input');
    sendCommentBtn.addEventListener('click', () => {
        const text = commentInput.value.trim();
        if (text) {
            handleComment(post.id, text, commentInput);
        }
    });
    commentInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const text = commentInput.value.trim();
            if (text) {
                handleComment(post.id, text, commentInput);
            }
        }
    });

    return div;
}

// Curtir post
function handleLike(postId, button) {
    if (socket) {
        socket.emit('curtir-post', postId);
        button.classList.add('liked');
    }
}

// Comentar em post
function handleComment(postId, text, input) {
    if (socket && currentUser) {
        socket.emit('comentar', {
            postId: postId,
            username: currentUser.username,
            text: text
        });
        input.value = '';
    }
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Logout
function handleLogout() {
    window.location.href = `${API_URL}/logout`;
}

// Inicializar WebSocket
function initializeSocket() {
    try {
        const script = document.createElement('script');
        script.src = 'https://cdn.socket.io/4.5.4/socket.io.min.js';
        script.onload = () => {
            socket = io(API_URL);

            socket.on('connect', () => {
                console.log('Conectado ao servidor');
            });

            socket.on('posts-iniciais', (posts) => {
                displayPosts(posts);
            });

            socket.on('novo-post', (post) => {
                const postElement = createPostElement(post);
                feedContainer.insertBefore(postElement, feedContainer.firstChild);
            });

            socket.on('post-curtido', ({ postId, likes }) => {
                const likeBtn = document.querySelector(`[data-post-id="${postId}"].like-btn`);
                if (likeBtn) {
                    likeBtn.querySelector('.likes-count').textContent = likes;
                }
            });

            socket.on('novo-comentario', ({ postId, comment }) => {
                const post = document.querySelector(`.post[data-post-id="${postId}"]`);
                if (post) {
                    const commentsSection = post.querySelector('.comments-section');
                    const newComment = document.createElement('div');
                    newComment.className = 'comment';
                    newComment.innerHTML = `
                        <div class="comment-author">${escapeHtml(comment.username)}</div>
                        <div class="comment-text">${escapeHtml(comment.text)}</div>
                        <div class="comment-time">${new Date(comment.timestamp).toLocaleString('pt-BR')}</div>
                    `;
                    commentsSection.appendChild(newComment);
                }
            });
        };
        document.head.appendChild(script);
    } catch (error) {
        console.error('Erro ao inicializar WebSocket:', error);
    }
}
