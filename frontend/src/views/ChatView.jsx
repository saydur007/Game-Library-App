import { useState, useEffect, useRef } from 'react';
import { getUsers, getConversation } from '../api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import './ChatView.css';

function ChatView() {
  const { user }               = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [users, setUsers]           = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState('');
  const [loading, setLoading]           = useState(false);
  const [disconnected, setDisconnected] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { getUsers().then(setUsers); }, []);

  useEffect(() => {
    if (!selectedUser) return;
    setLoading(true);
    getConversation(selectedUser._id)
      .then(msgs => {
        setMessages(msgs);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      })
      .finally(() => setLoading(false));
  }, [selectedUser]);

  useEffect(() => {
    if (!socket) return;
    const myId = String(user._id || user.id);
    function onPrivateMessage(msg) {
      const isRelevant =
        String(msg.senderId) === String(selectedUser?._id) ||
        (String(msg.recipientId) === String(selectedUser?._id) && String(msg.senderId) === myId);
      if (isRelevant) {
        setMessages(prev => [...prev, msg]);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      }
    }
    socket.on('private_message', onPrivateMessage);
    socket.on('message_sent',    onPrivateMessage);
    socket.on('disconnect', () => setDisconnected(true));
    socket.on('connect',    () => setDisconnected(false));
    return () => {
      socket.off('private_message', onPrivateMessage);
      socket.off('message_sent',    onPrivateMessage);
      socket.off('disconnect');
      socket.off('connect');
    };
  }, [socket, selectedUser, user]);

  function sendMessage(e) {
    e.preventDefault();
    if (!input.trim() || !selectedUser || !socket) return;
    socket.emit('send_message', { recipientId: selectedUser._id, content: input.trim() });
    setInput('');
  }

  return (
    <div className="chat-layout">
      {disconnected && (
        <div className="chat-disconnect-banner" role="alert">
          Connection lost — reconnecting…
        </div>
      )}
      <aside className="chat-sidebar">
        <h3 className="chat-sidebar-title">Direct Messages</h3>
        {users.length === 0 && <p className="chat-empty">No other users yet.</p>}
        {users.map(u => (
          <button
            key={u._id}
            className={`chat-user-btn ${selectedUser?._id === u._id ? 'active' : ''}`}
            onClick={() => setSelectedUser(u)}
          >
            <span className={`online-dot ${onlineUsers.includes(u._id) ? 'is-online' : ''}`} />
            <span className="chat-username">{u.username}</span>
            {onlineUsers.includes(u._id) && <span className="online-badge">online</span>}
          </button>
        ))}
      </aside>

      <section className="chat-main">
        {!selectedUser ? (
          <div className="chat-placeholder">
            <span className="chat-placeholder-icon">💬</span>
            <p>Select a user to start chatting</p>
          </div>
        ) : (
          <>
            <div className="chat-header">
              <span className={`online-dot ${onlineUsers.includes(selectedUser._id) ? 'is-online' : ''}`} />
              <strong className="chat-header-name">{selectedUser.username}</strong>
              <span className={onlineUsers.includes(selectedUser._id) ? 'status-online' : 'status-offline'}>
                {onlineUsers.includes(selectedUser._id) ? 'Online' : 'Offline'}
              </span>
            </div>

            <div className="chat-messages">
              {loading && <p className="chat-loading">Loading messages…</p>}
              {!loading && messages.length === 0 && (
                <p className="chat-empty-convo">No messages yet. Say hello! 👋</p>
              )}
              {messages.map((m, i) => (
                <div
                  key={m._id || i}
                  className={`chat-bubble ${String(m.senderId) === String(user._id || user.id) ? 'mine' : 'theirs'}`}
                >
                  <span className="bubble-content">{m.content}</span>
                  <span className="bubble-time">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <form className="chat-input-row" onSubmit={sendMessage}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={`Message ${selectedUser.username}…`}
                autoFocus
              />
              <button type="submit" disabled={!input.trim()} className="chat-send-btn">Send</button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}

export default ChatView;
