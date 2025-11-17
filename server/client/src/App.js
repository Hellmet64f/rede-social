import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import './App.css';

const socket = io();

function App() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    socket.on('posts-iniciais', (initialPosts) => {
      setPosts(initialPosts);
    });

    socket.on('novo-post', (newPost) => {
      setPosts((prev) => [newPost, ...prev]);
    });

    socket.on('post-curtido', ({ postId, likes }) => {
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, likes } : post
        )
      );
    });

    return () => {
      socket.off('posts-iniciais');
      socket.off('novo-post');
      socket.off('post-curtido');
    };
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/user');
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    if (!content.trim()) return;
    try {
      await axios.post('/api/posts', { content });
      setContent('');
    } catch (error) {
      console.error('Erro ao postar:', error);
    }
  };

  if (loading) return <div className="app">Carregando...</div>;

  return (
    <div className="app">
      {!user ? (
        <div className="login">
          <h1>Rede Social</h1>
          <a href="/auth/github" className="btn">Entrar com GitHub</a>
        </div>
      ) : (
        <>
          <header className="header">
            <h1>Rede Social</h1>
            <div className="user-info">
              <img src={user.avatar} alt={user.username} />
              <span>{user.username}</span>
              <a href="/logout" className="btn-logout">Sair</a>
            </div>
          </header>
          <main className="main">
            <div className="post-form">
              <textarea
                placeholder="Oque esta pensando?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <button onClick={handlePost}>Postar</button>
            </div>
            <div className="posts">
              {posts.map((post) => (
                <div key={post.id} className="post">
                  <div className="post-header">
                    <img src={post.avatar} alt={post.username} />
                    <div>
                      <strong>{post.username}</strong>
                      <small>{new Date(post.timestamp).toLocaleString()}</small>
                    </div>
                  </div>
                  <p className="post-content">{post.content}</p>
                  {post.fileUrl && (
                    <img src={post.fileUrl} alt="post" className="post-image" />
                  )}
                  <div className="post-actions">
                    <button onClick={() => socket.emit('curtir-post', post.id)}>
                      Like ({post.likes})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </>
      )}
    </div>
  );
}

export default App;
