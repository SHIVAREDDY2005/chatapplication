import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import GroupModal from '../components/GroupModal';

const socket = io(import.meta.env.VITE_SOCKET_URL, { autoConnect: false });

export default function ChatPage() {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [text, setText] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingText, setTypingText] = useState('');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [showGroupModal, setShowGroupModal] = useState(false);

  const currentTargetId = useMemo(() => selectedChat?._id, [selectedChat]);

  useEffect(() => {
    document.body.className = darkMode ? 'dark' : '';
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const loadSidebar = async () => {
    const [usersRes, groupsRes] = await Promise.all([api.get('/users'), api.get('/groups')]);
    setUsers(usersRes.data);
    setGroups(groupsRes.data);
  };

  useEffect(() => {
    loadSidebar();
    socket.connect();
    socket.emit('user:online', user._id);

    socket.on('online:users', setOnlineUsers);
    socket.on('message:receive', ({ message, groupId }) => {
      if ((selectedChat?.type === 'user' && message.sender._id === selectedChat._id) || (selectedChat?.type === 'group' && selectedChat._id === groupId)) {
        setMessages((prev) => [...prev, message]);
      }
      loadSidebar();
    });

    socket.on('typing:start', ({ from, groupId }) => {
      if (selectedChat?.type === 'group' && groupId === selectedChat._id) setTypingText('Someone is typing...');
      const typingUser = users.find((u) => u._id === from);
      if (typingUser) setTypingText(`${typingUser.name} is typing...`);
    });
    socket.on('typing:stop', () => setTypingText(''));
    socket.on('message:seen', ({ messageId }) => {
      setMessages((prev) => prev.map((m) => (m._id === messageId ? { ...m, seenBy: [...(m.seenBy || []), 'seen'] } : m)));
    });

    return () => {
      socket.off('online:users');
      socket.off('message:receive');
      socket.off('typing:start');
      socket.off('typing:stop');
      socket.off('message:seen');
      socket.disconnect();
    };
  }, []);

  const loadMessages = async (chat) => {
    setSelectedChat(chat);
    if (chat.type === 'group') {
      socket.emit('group:join', chat._id);
      const { data } = await api.get(`/messages/group/${chat._id}`);
      setMessages(data);
      await loadSidebar();
      return;
    }

    const { data } = await api.get(`/messages/${chat._id}`);
    setMessages(data);
    await loadSidebar();

    data.forEach((m) => {
      if (m.sender?._id === chat._id) {
        socket.emit('message:seen', { messageId: m._id, senderId: chat._id });
      }
    });
  };

  const sendMessage = async () => {
    if (!text.trim() || !selectedChat) return;

    const payload = selectedChat.type === 'group' ? { groupId: currentTargetId, message: text } : { receiver: currentTargetId, message: text };

    const { data } = await api.post('/messages', payload);
    setMessages((prev) => [...prev, data]);
    socket.emit('message:send', { message: data, receiver: currentTargetId, groupId: selectedChat.type === 'group' ? currentTargetId : null });
    setText('');
    socket.emit('typing:stop', { to: currentTargetId, from: user._id, groupId: selectedChat.type === 'group' ? currentTargetId : null });
    await loadSidebar();
  };

  const handleTyping = (value) => {
    setText(value);
    if (!selectedChat) return;
    socket.emit('typing:start', { to: currentTargetId, from: user._id, groupId: selectedChat.type === 'group' ? currentTargetId : null });
  };

  const handleCreateGroup = async ({ name, members }) => {
    await api.post('/groups', { name, members });
    setShowGroupModal(false);
    loadSidebar();
  };

  return (
    <div className="chat-layout">
      <Sidebar users={users} groups={groups} onlineUsers={onlineUsers} selectedChat={selectedChat} onSelect={loadMessages} onCreateGroup={() => setShowGroupModal(true)} />
      <main className="chat-main">
        <header>
          <h2>{selectedChat ? (selectedChat.type === 'group' ? `#${selectedChat.name}` : selectedChat.name) : 'Select a chat'}</h2>
          <div>
            <button onClick={() => setDarkMode((v) => !v)}>{darkMode ? 'Light' : 'Dark'} mode</button>
            <button onClick={logout}>Logout</button>
          </div>
        </header>
        <ChatWindow messages={messages} currentUser={user} typingText={typingText} />
        <footer>
          <input value={text} onChange={(e) => handleTyping(e.target.value)} onBlur={() => socket.emit('typing:stop', { to: currentTargetId, from: user._id })} placeholder="Type a message" />
          <button onClick={sendMessage}>Send</button>
        </footer>
      </main>
      {showGroupModal && <GroupModal users={users} onClose={() => setShowGroupModal(false)} onSubmit={handleCreateGroup} />}
    </div>
  );
}
